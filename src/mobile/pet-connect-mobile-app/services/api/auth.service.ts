// Authentication service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import { LoginCredentials, RegisterData, User, AuthTokens } from '@/types/auth.types';
import { tokenStorage, userStorage } from '@/utils/storage';

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // TODO: Implement Keycloak OAuth2/OIDC integration
    // For now, using mock structure
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
      '/auth/login',
      credentials
    );

    // Save tokens and user data
    await tokenStorage.saveTokens(response.tokens.accessToken, response.tokens.refreshToken);
    await userStorage.saveUser(response.user);

    return response;
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
      '/auth/register',
      data
    );

    await tokenStorage.saveTokens(response.tokens.accessToken, response.tokens.refreshToken);
    await userStorage.saveUser(response.user);

    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await tokenStorage.clearTokens();
      await userStorage.clearUser();
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    });

    await tokenStorage.saveTokens(response.accessToken, response.refreshToken);

    return response;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await apiClient.get<User>('/auth/me');
      await userStorage.saveUser(user);
      return user;
    } catch (error) {
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  }

  async checkAuth(): Promise<boolean> {
    const token = await tokenStorage.getAccessToken();
    if (!token) {
      return false;
    }

    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();


