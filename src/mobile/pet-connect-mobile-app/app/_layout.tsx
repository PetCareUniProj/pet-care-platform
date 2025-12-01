// Root layout with Keycloak session management

import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/store/auth.store';
import '@/global.css';

export const unstable_settings = {
  // Initial route should be onboarding for non-authenticated users
  initialRouteName: '(auth)',
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isInitialized, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isInitialized || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (isAuthenticated && inAuthGroup) {
      // User is authenticated but on auth screen - redirect to dashboard
      router.replace('/(tabs)/dashboard');
    } else if (!isAuthenticated && inTabsGroup) {
      // User is not authenticated but trying to access protected tabs
      // Redirect to onboarding (which is the auth group)
      router.replace('/(auth)/onboarding');
    }
  }, [isAuthenticated, isInitialized, segments, navigationState?.key, router]);

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutContent() {
  const { colorScheme, isDark } = useTheme();

  return (
    <GluestackUIProvider mode={colorScheme}>
      <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="cart" />
            <Stack.Screen name="shop" />
            <Stack.Screen name="pets/[id]" />
            <Stack.Screen name="pets/create" />
            <Stack.Screen name="pets-list" />
            <Stack.Screen name="health" />
            <Stack.Screen name="documents" />
            <Stack.Screen name="stats" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="subscriptions" />
          </Stack>
        </AuthGuard>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationThemeProvider>
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
