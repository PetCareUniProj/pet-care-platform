// Empty State component

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  actionLabel?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}

export function EmptyState({
  title,
  message,
  icon = 'inbox',
  iconColor = '#9ca3af',
  actionLabel,
  onAction,
  fullScreen = false,
}: EmptyStateProps) {
  const content = (
    <View className="items-center justify-center gap-4 px-6">
      <View className="bg-gray-100 p-6 rounded-full">
        <MaterialIcons name={icon} size={56} color={iconColor} />
      </View>
      
      <View className="items-center gap-2">
        <Text className="text-xl font-bold text-gray-800 text-center">
          {title}
        </Text>
        {message && (
          <Text className="text-gray-600 text-center text-base max-w-sm">
            {message}
          </Text>
        )}
      </View>

      {onAction && actionLabel && (
        <TouchableOpacity
          className="bg-orange-500 px-6 py-3 rounded-2xl items-center shadow-lg shadow-orange-200 active:scale-[0.98] mt-2"
          onPress={onAction}>
          <Text className="text-white font-bold text-base">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        {content}
      </View>
    );
  }

  return content;
}

// Predefined empty states
export function EmptyPets({ onAddPet }: { onAddPet?: () => void }) {
  return (
    <EmptyState
      title="Немає тварин"
      message="Додайте свого першого улюбленця, щоб почати користуватися додатком"
      icon="pets"
      iconColor="#f97316"
      actionLabel="Додати тварину"
      onAction={onAddPet}
    />
  );
}

export function EmptyReminders({ onCreateReminder }: { onCreateReminder?: () => void }) {
  return (
    <EmptyState
      title="Немає нагадувань"
      message="Створіть нагадування для важливих подій та процедур"
      icon="notifications-none"
      iconColor="#f97316"
      actionLabel="Створити нагадування"
      onAction={onCreateReminder}
    />
  );
}

export function EmptyOrders({ onShop }: { onShop?: () => void }) {
  return (
    <EmptyState
      title="Немає замовлень"
      message="Ваші замовлення з'являться тут після покупок"
      icon="shopping-bag"
      iconColor="#f97316"
      actionLabel="Перейти до магазину"
      onAction={onShop}
    />
  );
}

export function EmptySearch({ searchQuery }: { searchQuery?: string }) {
  return (
    <EmptyState
      title={searchQuery ? `Нічого не знайдено для "${searchQuery}"` : 'Нічого не знайдено'}
      message="Спробуйте змінити параметри пошуку"
      icon="search-off"
      iconColor="#9ca3af"
    />
  );
}

