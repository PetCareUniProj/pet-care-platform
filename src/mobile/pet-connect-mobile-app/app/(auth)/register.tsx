// Registration Screen

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store';

export default function RegisterScreen() {
  const { register, isLoading } = useAuthStore();
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    try {
      await register();
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      if (!err.message?.includes('скасовано') && !err.message?.includes('Redirecting')) {
        setError(err.message || 'Помилка реєстрації');
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      {/* Header */}
      <LinearGradient colors={['#fb923c', '#f59e0b']} start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }}>
        <View className="items-center gap-4 px-6 pt-20 pb-12">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center">
            <MaterialIcons name="person-add" size={40} color="#f97316" />
          </View>
          <Text className="text-white text-3xl font-bold">Реєстрація</Text>
          <Text className="text-white/80 text-center">Створіть новий акаунт</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View className="px-6 pt-8 gap-5">
        {/* Info Card */}
        <View className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <View className="flex-row items-start gap-3">
            <MaterialIcons name="info-outline" size={24} color="#f59e0b" />
            <View className="flex-1">
              <Text className="text-amber-800 font-semibold mb-1">Безпечна реєстрація</Text>
              <Text className="text-amber-700">
                Ви будете перенаправлені на захищену сторінку для створення акаунту. Після реєстрації ви автоматично увійдете в застосунок.
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View className="gap-3">
          <Text className="text-gray-700 font-semibold ml-1">Що ви отримаєте:</Text>
          
          <View className="flex-row items-center gap-3 bg-gray-50 p-4 rounded-xl">
            <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center">
              <MaterialIcons name="pets" size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Профілі улюбленців</Text>
              <Text className="text-gray-500 text-sm">Додавайте та відстежуйте своїх тварин</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 bg-gray-50 p-4 rounded-xl">
            <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center">
              <MaterialIcons name="notifications" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Нагадування</Text>
              <Text className="text-gray-500 text-sm">Не пропускайте важливі події</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 bg-gray-50 p-4 rounded-xl">
            <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center">
              <MaterialIcons name="shopping-cart" size={20} color="#a855f7" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Магазин товарів</Text>
              <Text className="text-gray-500 text-sm">Купуйте все необхідне для улюбленців</Text>
            </View>
          </View>
        </View>

        {/* Error */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        )}

        {/* Register Button */}
        <TouchableOpacity
          className="bg-orange-500 py-4 rounded-xl items-center flex-row justify-center gap-2"
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialIcons name="person-add" size={22} color="white" />
              <Text className="text-white font-bold text-lg">Зареєструватися</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center gap-1 mt-2">
          <Text className="text-gray-600">Вже є акаунт?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-orange-500 font-semibold">Увійти</Text>
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
