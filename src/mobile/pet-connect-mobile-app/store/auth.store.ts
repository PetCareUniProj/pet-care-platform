// Authentication Store

import { create } from 'zustand';
import { authService, AuthUser, LoginCredentials } from '@/lib/keycloak';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithBrowser: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { firstName?: string; lastName?: string; email?: string }) => Promise<void>;
  openAccountSettings: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,

  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    try {
      const isAuth = await authService.initialize();
      set({
        user: authService.getUser(),
        isAuthenticated: isAuth,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.loginWithCredentials(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  loginWithBrowser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.loginWithBrowser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  register: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      set({ user: null, isAuthenticated: false, isLoading: false, error: error.message });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      await authService.updateProfile(updates);
      set({ user: authService.getUser(), isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  openAccountSettings: async () => {
    try {
      await authService.openAccountSettings();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  refreshUser: () => {
    set({ user: authService.getUser() });
  },

  clearError: () => set({ error: null }),
}));

export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthLoading = () => useAuthStore((s) => s.isLoading);
export const useAuthError = () => useAuthStore((s) => s.error);
