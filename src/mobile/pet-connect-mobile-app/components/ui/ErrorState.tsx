// Error State component

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  fullScreen?: boolean;
}

export function ErrorState({
  title = 'Щось пішло не так',
  message = 'Сталася помилка. Спробуйте ще раз.',
  onRetry,
  retryText = 'Спробувати знову',
  icon = 'error-outline',
  fullScreen = false,
}: ErrorStateProps) {
  const content = (
    <View className="items-center justify-center gap-4 px-6">
      <View className="bg-red-100 p-4 rounded-full">
        <MaterialIcons name={icon} size={48} color="#ef4444" />
      </View>
      
      <View className="items-center gap-2">
        <Text className="text-xl font-bold text-gray-800 text-center">
          {title}
        </Text>
        <Text className="text-gray-600 text-center text-base max-w-sm">
          {message}
        </Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          className="bg-orange-500 px-6 py-3 rounded-2xl items-center shadow-lg shadow-orange-200 active:scale-[0.98] mt-2"
          onPress={onRetry}>
          <Text className="text-white font-bold text-base">{retryText}</Text>
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

// Network Error component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Немає з'єднання"
      message="Перевірте підключення до інтернету та спробуйте ще раз"
      icon="wifi-off"
      onRetry={onRetry}
      retryText="Оновити"
    />
  );
}

