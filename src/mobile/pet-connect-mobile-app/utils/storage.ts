// Storage utilities

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Secure storage keys
const SECURE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

// AsyncStorage keys
const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

const isSecureStoreAvailable = Platform.OS !== 'web';

/**
 * Secure storage for sensitive data (tokens, credentials)
 * Falls back to AsyncStorage on web (not secure, but functional for development)
 */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(`secure_${key}`, value);
      }
    } catch (error) {
      console.error('Error saving to secure storage:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(`secure_${key}`);
      }
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(`secure_${key}`);
      }
    } catch (error) {
      console.error('Error removing from secure storage:', error);
      throw error;
    }
  },
};

/**
 * Regular storage for non-sensitive data
 */
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};

/**
 * Token storage helpers
 */
export const tokenStorage = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      secureStorage.setItem(SECURE_KEYS.ACCESS_TOKEN, accessToken),
      secureStorage.setItem(SECURE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return secureStorage.getItem(SECURE_KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorage.removeItem(SECURE_KEYS.ACCESS_TOKEN),
      secureStorage.removeItem(SECURE_KEYS.REFRESH_TOKEN),
    ]);
  },
};

/**
 * User data storage helpers
 */
export const userStorage = {
  async saveUser(user: any): Promise<void> {
    await storage.setItem(SECURE_KEYS.USER_DATA, JSON.stringify(user));
  },

  async getUser(): Promise<any | null> {
    const userData = await storage.getItem(SECURE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  async clearUser(): Promise<void> {
    await storage.removeItem(SECURE_KEYS.USER_DATA);
  },
};

export { SECURE_KEYS, STORAGE_KEYS };


