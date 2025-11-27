// Login screen

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#fb923c', '#f59e0b']} // orange-400 to amber-500
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
        >
          <View className="items-center gap-4 mt-8 rounded-b-[40px] px-6 pt-16 pb-12">
            <View className="relative">
              <View className="absolute bg-white/20 w-24 h-24 rounded-full blur-xl" />
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-white shadow-lg">
                <MaterialIcons name="pets" size={40} color="#f97316" />
              </View>
            </View>
            
            <View className="items-center gap-2">
              <Text className="text-white text-3xl font-extrabold text-center">
                Вітаємо знову!
              </Text>
              <Text className="text-white text-base text-center opacity-90 px-4">
                Увійдіть до свого акаунту
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View className="px-6 pt-8 pb-8">
          <View className="gap-6">
            {/* Email Input */}
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Email</Text>
              <View className={`bg-gray-50 border rounded-2xl px-4 py-4 flex-row items-center ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              }`}>
                <View className="bg-orange-100 p-2 rounded-xl mr-3">
                  <MaterialIcons name="email" size={20} color="#f97316" />
                </View>
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-sm mt-2 ml-1">{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Пароль</Text>
              <View className={`bg-gray-50 border rounded-2xl px-4 py-4 flex-row items-center ${
                errors.password ? 'border-red-300' : 'border-gray-200'
              }`}>
                <View className="bg-orange-100 p-2 rounded-xl mr-3">
                  <MaterialIcons name="lock" size={20} color="#f97316" />
                </View>
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="ml-2 p-1">
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-2 ml-1">{errors.password}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              className="self-end"
              onPress={() => router.push('/(auth)/forgot-password')}>
              <Text className="text-orange-500 font-semibold text-sm">Забули пароль?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:scale-[0.98] mt-2"
              onPress={handleLogin}
              disabled={isLoading}>
              <Text className="text-white font-bold text-lg">
                {isLoading ? 'Вхід...' : 'Увійти'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center gap-4 my-4">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="text-gray-400 text-sm">або</Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center items-center gap-2">
              <Text className="text-gray-600">Немає акаунту? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-orange-500 font-bold">Зареєструватися</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


