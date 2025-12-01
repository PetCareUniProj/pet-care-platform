// Auth Service - wrapper for keycloak auth

import { authService as keycloakAuth, LoginCredentials, AuthUser } from '@/lib/keycloak';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

class AuthApiService {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthUser> {
    return keycloakAuth.loginWithCredentials({ email, password });
  }

  /**
   * Login via browser OAuth
   */
  async loginWithBrowser(): Promise<AuthUser> {
    return keycloakAuth.loginWithBrowser();
  }

  /**
   * Register new user
   * Note: Keycloak usually requires admin API for user creation
   * This will try to login after registration attempt
   */
  async register(data: RegisterData): Promise<AuthUser> {
    // For now, redirect to browser login which can handle registration
    // Keycloak login page has "Register" link
    return keycloakAuth.loginWithBrowser();
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await keycloakAuth.logout();
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return keycloakAuth.getAccessToken();
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return keycloakAuth.getUser();
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return keycloakAuth.isAuthenticated();
  }
}

export const authService = new AuthApiService();
