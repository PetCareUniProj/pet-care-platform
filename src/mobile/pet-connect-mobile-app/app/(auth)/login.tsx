// Login Screen - Simple email/password with OAuth fallback

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store';

export default function LoginScreen() {
  const { login, loginWithBrowser, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      setLocalError('Введіть email');
      return;
    }
    if (!password) {
      setLocalError('Введіть пароль');
      return;
    }

    setLocalError('');
    clearError();

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      // If direct login fails, show error but don't auto-fallback
      setLocalError(err.message || 'Помилка входу');
    }
  };

  const handleBrowserLogin = async () => {
    setLocalError('');
    clearError();

    try {
      await loginWithBrowser();
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      if (err.message !== 'Авторизацію скасовано') {
        setLocalError(err.message || 'Помилка входу');
      }
    }
  };

  const displayError = localError || error;

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      {/* Header */}
      <LinearGradient colors={['#fb923c', '#f59e0b']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
        <View className="items-center gap-4 px-6 pt-20 pb-12">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center">
            <MaterialIcons name="pets" size={40} color="#f97316" />
          </View>
          <Text className="text-white text-3xl font-bold">Вхід</Text>
          <Text className="text-white/80 text-center">Увійдіть до свого акаунту</Text>
        </View>
      </LinearGradient>

      {/* Form */}
      <View className="px-6 pt-8 gap-5">
        {/* Email */}
        <View>
          <Text className="text-gray-700 font-medium mb-2">Email</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <MaterialIcons name="email" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-3 text-gray-800"
              placeholder="your@email.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Password */}
        <View>
          <Text className="text-gray-700 font-medium mb-2">Пароль</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <MaterialIcons name="lock" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-3 text-gray-800"
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error */}
        {displayError && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3">
            <Text className="text-red-600 text-center">{displayError}</Text>
          </View>
        )}

        {/* Login Button */}
        <TouchableOpacity
          className="bg-orange-500 py-4 rounded-xl items-center"
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Увійти</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center gap-4 my-2">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-gray-400">або</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Browser Login */}
        <TouchableOpacity
          className="bg-blue-600 py-4 rounded-xl items-center flex-row justify-center gap-2"
          onPress={handleBrowserLogin}
          disabled={isLoading}
        >
          <MaterialIcons name="open-in-browser" size={20} color="white" />
          <Text className="text-white font-bold">Увійти через браузер</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View className="flex-row justify-center gap-1 mt-4">
          <Text className="text-gray-600">Немає акаунту?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')} disabled={isLoading}>
            <Text className="text-orange-500 font-semibold">Зареєструватися</Text>
          </TouchableOpacity>
        </View>

        {/* Back */}
        <TouchableOpacity
          className="py-4 items-center"
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text className="text-gray-500">← Назад</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
