// Loading Spinner component

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#f97316',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <View className="items-center justify-center gap-4">
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-gray-600 font-semibold text-base">{text}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {content}
      </View>
    );
  }

  return content;
}

// Inline loading spinner for buttons
export function InlineSpinner({ color = '#ffffff' }: { color?: string }) {
  return <ActivityIndicator size="small" color={color} />;
}




