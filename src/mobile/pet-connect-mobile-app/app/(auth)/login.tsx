// Login screen

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { authService } from '@/services/api';
import { LoginCredentials } from '@/types/auth.types';
import { validators } from '@/utils/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!validators.required(email)) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!validators.email(email)) {
      newErrors.email = 'Невірний формат email';
    }

    if (!validators.required(password)) {
      newErrors.password = 'Пароль обов\'язковий';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const credentials: LoginCredentials = { email, password };
      await authService.login(credentials);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Помилка входу', error.message || 'Невірний email або пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Вхід</Text>
          <Text className="text-gray-600">Вітаємо назад! Увійдіть до свого акаунту</Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
          <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
            <MaterialIcons name="email" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>}
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Пароль</Text>
          <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
            <MaterialIcons name="lock" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
          )}
        </View>

        <TouchableOpacity
          className="bg-yellow-400 px-6 py-4 rounded-lg mb-4"
          onPress={handleLogin}
          disabled={isLoading}>
          <Text className="text-white font-semibold text-center text-lg">
            {isLoading ? 'Вхід...' : 'Увійти'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mb-6"
          onPress={() => router.push('/(auth)/forgot-password')}>
          <Text className="text-yellow-600 text-center font-semibold">Забули пароль?</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Немає акаунту? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-yellow-600 font-semibold">Зареєструватися</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}


