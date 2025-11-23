// Components Demo page - для перевірки UI компонентів

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import {
  LoadingSpinner,
  InlineSpinner,
  ErrorState,
  NetworkError,
  EmptyState,
  EmptyPets,
  EmptyReminders,
  EmptyOrders,
  EmptySearch,
} from '@/components/ui';

export default function ComponentsDemoScreen() {
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showNetworkError, setShowNetworkError] = useState(false);

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#fb923c', '#f59e0b']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        className="rounded-b-[40px] px-6 pt-16 pb-12"
      >
        <View className="items-center gap-4 mt-8">
          <View className="relative">
            <View className="absolute bg-white/20 w-24 h-24 rounded-full blur-xl" />
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-white shadow-lg">
              <MaterialIcons name="palette" size={40} color="#f97316" />
            </View>
          </View>
          
          <View className="items-center gap-2">
            <Text className="text-white text-3xl font-extrabold text-center">
              UI Компоненти
            </Text>
            <Text className="text-white text-base text-center opacity-90 px-4">
              Демонстрація базових компонентів
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View className="px-6 pt-8 pb-8 gap-8">
        {/* Loading Spinner */}
        <View className="gap-4">
          <Text className="text-xl font-bold text-gray-800">Loading Spinner</Text>
          <View className="bg-gray-50 p-6 rounded-2xl border border-gray-200 gap-4">
            <LoadingSpinner text="Завантаження..." />
            <View className="h-[1px] bg-gray-200" />
            <LoadingSpinner size="small" text="Маленький спіннер" />
            <View className="h-[1px] bg-gray-200" />
            <TouchableOpacity
              className="bg-orange-500 py-3 rounded-xl items-center flex-row justify-center gap-2"
              onPress={() => {
                setShowLoading(true);
                setTimeout(() => setShowLoading(false), 2000);
              }}>
              {showLoading ? (
                <InlineSpinner />
              ) : (
                <Text className="text-white font-bold">Кнопка зі спіннером</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Error States */}
        <View className="gap-4">
          <Text className="text-xl font-bold text-gray-800">Error States</Text>
          <View className="bg-gray-50 p-6 rounded-2xl border border-gray-200 gap-4">
            <ErrorState
              title="Помилка завантаження"
              message="Не вдалося завантажити дані"
              onRetry={() => setShowError(false)}
            />
            <View className="h-[1px] bg-gray-200" />
            <NetworkError onRetry={() => setShowNetworkError(false)} />
          </View>
        </View>

        {/* Empty States */}
        <View className="gap-4">
          <Text className="text-xl font-bold text-gray-800">Empty States</Text>
          <View className="bg-gray-50 p-6 rounded-2xl border border-gray-200 gap-6">
            <EmptyPets onAddPet={() => console.log('Add pet')} />
            <View className="h-[1px] bg-gray-200" />
            <EmptyReminders onCreateReminder={() => console.log('Create reminder')} />
            <View className="h-[1px] bg-gray-200" />
            <EmptyOrders onShop={() => console.log('Go to shop')} />
            <View className="h-[1px] bg-gray-200" />
            <EmptySearch searchQuery="корм" />
            <View className="h-[1px] bg-gray-200" />
            <EmptyState
              title="Кастомний порожній стан"
              message="Це приклад кастомного порожнього стану з власними параметрами"
              icon="folder-open"
              iconColor="#f97316"
              actionLabel="Додати щось"
              onAction={() => console.log('Custom action')}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

