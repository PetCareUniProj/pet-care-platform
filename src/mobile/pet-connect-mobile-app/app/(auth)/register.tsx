// Register screen

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
      newErrors.phone = 'Невірний формат телефону';
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
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Реєстрація</Text>
          <Text className="text-gray-600">Створіть новий акаунт для початку роботи</Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Ім'я</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Ваше ім'я"
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Прізвище</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Ваше прізвище"
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Email *</Text>
          <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
            <MaterialIcons name="email" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
          {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Телефон</Text>
          <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
            <MaterialIcons name="phone" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="+380 XX XXX XX XX"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>
          {errors.phone && <Text className="text-red-500 text-sm mt-1">{errors.phone}</Text>}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Пароль *</Text>
          <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
            <MaterialIcons name="lock" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
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

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Підтвердження паролю *</Text>
          <View className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center">
            <MaterialIcons name="lock" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>
          {errors.confirmPassword && (
            <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text>
          )}
        </View>

        <TouchableOpacity
          className="bg-yellow-400 px-6 py-4 rounded-lg mb-4"
          onPress={handleRegister}
          disabled={isLoading}>
          <Text className="text-white font-semibold text-center text-lg">
            {isLoading ? 'Реєстрація...' : 'Зареєструватися'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Вже є акаунт? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-yellow-600 font-semibold">Увійти</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}


