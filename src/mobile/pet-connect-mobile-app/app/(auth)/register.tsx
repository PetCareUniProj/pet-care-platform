// Register screen

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { authService } from '@/services/api';
import { RegisterData } from '@/types/auth.types';
import { validators } from '@/utils/validation';

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validators.required(formData.email)) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!validators.email(formData.email)) {
      newErrors.email = 'Невірний формат email';
    }

    if (!validators.required(formData.password)) {
      newErrors.password = 'Пароль обов\'язковий';
    } else if (!validators.password(formData.password)) {
      newErrors.password =
        'Пароль має містити мінімум 8 символів, велику літеру, малу літеру та цифру';
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }

    if (formData.phone && !validators.phone(formData.phone)) {
      newErrors.phone = 'Невірний формат телефону. Використовуйте формат: +380 XX XXX XX XX або 0XX XXX XX XX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.register(formData);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Помилка реєстрації', error.message || 'Не вдалося зареєструватися');
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
          className="rounded-b-[40px] px-6 pt-16 pb-12"
        >
          <View className="items-center gap-4 mt-8">
            <View className="relative">
              <View className="absolute bg-white/20 w-24 h-24 rounded-full blur-xl" />
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-white shadow-lg">
                <MaterialIcons name="person-add" size={40} color="#f97316" />
              </View>
            </View>
            
            <View className="items-center gap-2">
              <Text className="text-white text-3xl font-extrabold text-center">
                Створіть акаунт
              </Text>
              <Text className="text-white text-base text-center opacity-90 px-4">
                Приєднуйся до спільноти Pet Connect
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View className="px-6 pt-8 pb-8">
          <View className="gap-5">
            {/* Name and Last Name Row */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Ім'я</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                  <TextInput
                    className="text-gray-800 text-base"
                    placeholder="Ваше ім'я"
                    placeholderTextColor="#9CA3AF"
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Прізвище</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4">
                  <TextInput
                    className="text-gray-800 text-base"
                    placeholder="Ваше прізвище"
                    placeholderTextColor="#9CA3AF"
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Email *</Text>
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
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-sm mt-2 ml-1">{errors.email}</Text>
              )}
            </View>

            {/* Phone Input */}
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Телефон</Text>
              <View className={`bg-gray-50 border rounded-2xl px-4 py-4 flex-row items-center ${
                errors.phone ? 'border-red-300' : 'border-gray-200'
              }`}>
                <View className="bg-orange-100 p-2 rounded-xl mr-3">
                  <MaterialIcons name="phone" size={20} color="#f97316" />
                </View>
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="+380 XX XXX XX XX"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
              {errors.phone && (
                <Text className="text-red-500 text-sm mt-2 ml-1">{errors.phone}</Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Пароль *</Text>
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
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password-new"
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

            {/* Confirm Password Input */}
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Підтвердження паролю *</Text>
              <View className={`bg-gray-50 border rounded-2xl px-4 py-4 flex-row items-center ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
              }`}>
                <View className="bg-orange-100 p-2 rounded-xl mr-3">
                  <MaterialIcons name="lock-outline" size={20} color="#f97316" />
                </View>
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-2 ml-1">{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className="bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:scale-[0.98] mt-2"
              onPress={handleRegister}
              disabled={isLoading}>
              <Text className="text-white font-bold text-lg">
                {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center gap-4 my-4">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text className="text-gray-400 text-sm">або</Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center items-center gap-2">
              <Text className="text-gray-600">Вже є акаунт? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-orange-500 font-bold">Увійти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


