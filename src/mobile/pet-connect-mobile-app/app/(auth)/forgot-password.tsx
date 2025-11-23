// Forgot password screen

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { authService } from '@/services/api';
import { validators } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!validators.email(email)) {
      Alert.alert('Помилка', 'Будь ласка, введіть валідний email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (error: any) {
      Alert.alert('Помилка', error.message || 'Не вдалося відправити лист');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 p-6 items-center justify-center">
          <View className="bg-green-100 p-4 rounded-full mb-6">
            <MaterialIcons name="check-circle" size={64} color="#10b981" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
            Лист відправлено!
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Перевірте свою пошту {email} для інструкцій щодо відновлення паролю
          </Text>
          <TouchableOpacity
            className="bg-yellow-400 px-6 py-4 rounded-lg w-full"
            onPress={() => router.back()}>
            <Text className="text-white font-semibold text-center text-lg">Повернутися</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Забули пароль?</Text>
          <Text className="text-gray-600">
            Введіть ваш email, і ми надішлемо вам інструкції для відновлення паролю
          </Text>
        </View>

        <View className="mb-6">
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
        </View>

        <TouchableOpacity
          className="bg-yellow-400 px-6 py-4 rounded-lg mb-4"
          onPress={handleSubmit}
          disabled={isLoading}>
          <Text className="text-white font-semibold text-center text-lg">
            {isLoading ? 'Відправка...' : 'Відправити'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mb-6" onPress={() => router.back()}>
          <Text className="text-yellow-600 text-center font-semibold">Повернутися до входу</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


