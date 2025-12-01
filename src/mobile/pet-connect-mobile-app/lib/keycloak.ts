// Keycloak OAuth Authentication for Expo
// Supports login, logout, registration, and profile management

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '@/constants/api';

// Enable web browser redirect
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_INFO: 'auth_user_info',
  EXPIRES_AT: 'auth_expires_at',
} as const;

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Authentication Service using Keycloak
 */
class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;
  private expiresAt: number = 0;
  private initialized = false;

  // Keycloak configuration
  private get config() {
    return {
      baseUrl: API_ENDPOINTS.AUTH.KEYCLOAK_BASE,
      realm: API_ENDPOINTS.AUTH.REALM,
      clientId: API_ENDPOINTS.AUTH.CLIENT_ID,
    };
  }

  private get tokenEndpoint() {
    return `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/token`;
  }

  private get authEndpoint() {
    return `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/auth`;
  }

  private get userInfoEndpoint() {
    return `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/userinfo`;
  }

  private get logoutEndpoint() {
    return `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/logout`;
  }

  private get registrationEndpoint() {
    return `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/registrations`;
  }

  private get accountEndpoint() {
    return `${this.config.baseUrl}/realms/${this.config.realm}/account`;
  }

  private get redirectUri() {
    return AuthSession.makeRedirectUri({
      scheme: 'petconnectmobileapp',
      path: 'callback',
    });
  }

  /**
   * Initialize - load saved session
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return this.isAuthenticated();

    try {
      const [token, refresh, user, expires] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_INFO),
        AsyncStorage.getItem(STORAGE_KEYS.EXPIRES_AT),
      ]);

      this.accessToken = token;
      this.refreshToken = refresh;
      this.user = user ? JSON.parse(user) : null;
      this.expiresAt = expires ? parseInt(expires) : 0;
      this.initialized = true;

      // Try to refresh if expired
      if (this.accessToken && this.isTokenExpired() && this.refreshToken) {
        try {
          await this.refreshAccessToken();
        } catch {
          await this.logout();
        }
      }

      return this.isAuthenticated();
    } catch (error) {
      console.error('Init error:', error);
      this.initialized = true;
      return false;
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    return Date.now() >= this.expiresAt - 30000;
  }

  getAccessToken(): string | null {
    return this.isTokenExpired() ? null : this.accessToken;
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  /**
   * Login with email/password (Direct Access Grant)
   */
  async loginWithCredentials(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const body = new URLSearchParams({
        grant_type: 'password',
        client_id: this.config.clientId,
        username: credentials.email,
        password: credentials.password,
        scope: 'openid profile email',
      });

      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        if (error.error === 'unauthorized_client') {
          return this.loginWithBrowser();
        }
        if (error.error === 'invalid_grant') {
          throw new Error('Невірний email або пароль');
        }
        throw new Error(error.error_description || 'Помилка входу');
      }

      const data = await response.json();
      await this.handleTokenResponse(data);

      if (!this.user) throw new Error('Не вдалося отримати дані');
      return this.user;
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Сервер недоступний. Перевірте підключення.');
      }
      throw error;
    }
  }

  /**
   * Login with OAuth browser popup
   */
  async loginWithBrowser(): Promise<AuthUser> {
    const discovery = {
      authorizationEndpoint: this.authEndpoint,
      tokenEndpoint: this.tokenEndpoint,
    };

    const request = new AuthSession.AuthRequest({
      clientId: this.config.clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: this.redirectUri,
      usePKCE: true,
    });

    const result = await request.promptAsync(discovery);

    if (result.type === 'success' && result.params.code) {
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: this.config.clientId,
          code: result.params.code,
          redirectUri: this.redirectUri,
          extraParams: { code_verifier: request.codeVerifier! },
        },
        discovery
      );

      await this.handleTokenResponse({
        access_token: tokenResult.accessToken,
        refresh_token: tokenResult.refreshToken,
        expires_in: tokenResult.expiresIn,
      });

      if (!this.user) throw new Error('Не вдалося отримати дані');
      return this.user;
    }

    if (result.type === 'cancel') {
      throw new Error('Авторизацію скасовано');
    }

    throw new Error('Помилка авторизації');
  }

  /**
   * Register new user via Keycloak registration page
   */
  async register(): Promise<AuthUser> {
    // Open Keycloak registration page
    const registrationUrl = `${this.authEndpoint}?client_id=${this.config.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=openid%20profile%20email&kc_action=register`;

    if (Platform.OS === 'web') {
      // For web, redirect to registration page
      window.location.href = registrationUrl;
      throw new Error('Redirecting to registration...');
    }

    // For native, use browser popup
    const result = await WebBrowser.openAuthSessionAsync(registrationUrl, this.redirectUri);

    if (result.type === 'success' && result.url) {
      // Parse the URL to get the authorization code
      const url = new URL(result.url);
      const code = url.searchParams.get('code');

      if (code) {
        // Exchange code for tokens
        const discovery = {
          authorizationEndpoint: this.authEndpoint,
          tokenEndpoint: this.tokenEndpoint,
        };

        // Create a dummy request for PKCE (Keycloak handles this)
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: this.config.clientId,
            code: code,
            redirectUri: this.redirectUri,
          },
          discovery
        );

        await this.handleTokenResponse({
          access_token: tokenResult.accessToken,
          refresh_token: tokenResult.refreshToken,
          expires_in: tokenResult.expiresIn,
        });

        if (!this.user) throw new Error('Не вдалося отримати дані');
        return this.user;
      }
    }

    if (result.type === 'cancel') {
      throw new Error('Реєстрацію скасовано');
    }

    throw new Error('Помилка реєстрації');
  }

  /**
   * Open Keycloak account management page
   */
  async openAccountSettings(): Promise<void> {
    const accountUrl = `${this.accountEndpoint}?referrer=${this.config.clientId}`;

    if (Platform.OS === 'web') {
      window.open(accountUrl, '_blank');
    } else {
      await WebBrowser.openBrowserAsync(accountUrl);
    }
  }

  /**
   * Handle token response and fetch user info
   */
  private async handleTokenResponse(data: any): Promise<void> {
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token || null;
    this.expiresAt = Date.now() + (data.expires_in || 300) * 1000;

    // Save tokens
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, this.accessToken!);
    await AsyncStorage.setItem(STORAGE_KEYS.EXPIRES_AT, this.expiresAt.toString());
    if (this.refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken);
    }

    // Get user info
    this.user = this.parseToken(this.accessToken!) || (await this.fetchUserInfo());
    if (this.user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(this.user));
    }
  }

  /**
   * Parse JWT to get user info
   */
  private parseToken(token: string): AuthUser | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        email: payload.email || payload.preferred_username,
        name: payload.name,
        firstName: payload.given_name,
        lastName: payload.family_name,
        roles: payload.realm_access?.roles || [],
      };
    } catch {
      return null;
    }
  }

  /**
   * Fetch user info from Keycloak
   */
  private async fetchUserInfo(): Promise<AuthUser | null> {
    if (!this.accessToken) return null;

    try {
      const response = await fetch(this.userInfoEndpoint, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data.sub,
          email: data.email,
          name: data.name,
          firstName: data.given_name,
          lastName: data.family_name,
        };
      }
    } catch (error) {
      console.warn('Failed to fetch user info:', error);
    }
    return null;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        refresh_token: this.refreshToken,
      });

      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!response.ok) throw new Error('Refresh failed');

      const data = await response.json();
      await this.handleTokenResponse(data);
      return true;
    } catch {
      await this.logout();
      return false;
    }
  }

  /**
   * Logout - clear tokens and end Keycloak session
   */
  async logout(): Promise<void> {
    // Try to revoke session on Keycloak
    if (this.refreshToken) {
      try {
        const body = new URLSearchParams({
          client_id: this.config.clientId,
          refresh_token: this.refreshToken,
        });

        await fetch(`${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        });
      } catch (error) {
        console.warn('Failed to revoke token:', error);
      }
    }

    // Clear local state
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.expiresAt = 0;

    // Clear storage
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_INFO),
      AsyncStorage.removeItem(STORAGE_KEYS.EXPIRES_AT),
    ]);
  }

  /**
   * Update user profile (requires re-login to see changes)
   */
  async updateProfile(updates: { firstName?: string; lastName?: string; email?: string }): Promise<void> {
    if (!this.accessToken) throw new Error('Не авторизовано');

    try {
      const response = await fetch(`${this.accountEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          firstName: updates.firstName,
          lastName: updates.lastName,
          email: updates.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Не вдалося оновити профіль');
      }

      // Update local user data
      if (this.user) {
        this.user = {
          ...this.user,
          firstName: updates.firstName || this.user.firstName,
          lastName: updates.lastName || this.user.lastName,
          email: updates.email || this.user.email,
          name: updates.firstName && updates.lastName 
            ? `${updates.firstName} ${updates.lastName}` 
            : this.user.name,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(this.user));
      }
    } catch (error: any) {
      // If API fails, open account page in browser
      console.warn('Profile update via API failed, opening account page:', error);
      await this.openAccountSettings();
      throw new Error('Відкрито сторінку налаштувань акаунту');
    }
  }
}

// Export as both names for compatibility
export const authService = new AuthService();
export const keycloakService = authService;
