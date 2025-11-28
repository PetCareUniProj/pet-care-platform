import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const THEME_STORAGE_KEY = '@pet_connect_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme || 'light');

  // Calculate actual color scheme based on mode
  const calculateColorScheme = useCallback((mode: ThemeMode, systemScheme: ColorScheme): ColorScheme => {
    if (mode === 'system') {
      return systemScheme;
    }
    return mode;
  }, []);

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          const mode = saved as ThemeMode;
          setThemeModeState(mode);
          setColorScheme(calculateColorScheme(mode, systemColorScheme || 'light'));
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, [calculateColorScheme, systemColorScheme]);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      if (themeMode === 'system' && newScheme) {
        setColorScheme(newScheme);
      }
    });

    return () => subscription.remove();
  }, [themeMode]);

  // Update color scheme when themeMode or systemColorScheme changes
  useEffect(() => {
    setColorScheme(calculateColorScheme(themeMode, systemColorScheme || 'light'));
  }, [themeMode, systemColorScheme, calculateColorScheme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      // Immediately update colorScheme
      setColorScheme(calculateColorScheme(mode, systemColorScheme || 'light'));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, [calculateColorScheme, systemColorScheme]);

  const value: ThemeContextType = {
    themeMode,
    colorScheme,
    setThemeMode,
    isDark: colorScheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme colors for light and dark modes
export const themes = {
  light: {
    background: '#f9fafb',
    card: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    primary: '#f97316',
    primaryLight: '#fed7aa',
  },
  dark: {
    background: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
    primary: '#fb923c',
    primaryLight: '#7c2d12',
  },
};

export function getTheme(scheme: ColorScheme) {
  return themes[scheme];
}
