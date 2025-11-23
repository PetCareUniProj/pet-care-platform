// Forgot password screen

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { authService } from '@/services/api';
import { validators } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    
    if (!validators.required(email)) {
      setError('Email обов\'язковий');
      return;
    }
    
    if (!validators.email(email)) {
      setError('Будь ласка, введіть валідний email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } catch (error: any) {
      setError(error.message || 'Не вдалося відправити лист');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#10b981', '#059669']} // green-500 to green-600
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 0 }}
            className="rounded-b-[40px] px-6 pt-16 pb-12"
          >
            <View className="items-center gap-4 mt-8">
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                }}>
                <View className="relative">
                  <View className="absolute bg-white/20 w-24 h-24 rounded-full blur-xl" />
                  <View className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-white shadow-lg">
                    <MaterialIcons name="check-circle" size={40} color="#10b981" />
                  </View>
                </View>
              </Animated.View>
              
              <View className="items-center gap-2">
                <Text className="text-white text-3xl font-extrabold text-center">
                  Лист відправлено!
                </Text>
                <Text className="text-white text-base text-center opacity-90 px-4">
                  Перевірте свою пошту {email} для інструкцій щодо відновлення паролю
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View className="px-6 pt-8 pb-8">
            <TouchableOpacity
              className="bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:scale-[0.98]"
              onPress={() => router.back()}>
              <Text className="text-white font-bold text-lg">Повернутися до входу</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

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
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}>
              <View className="relative">
                <View className="absolute bg-white/20 w-24 h-24 rounded-full blur-xl" />
                <View className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-white shadow-lg">
                  <MaterialIcons name="lock-reset" size={40} color="#f97316" />
                </View>
              </View>
            </Animated.View>
            
            <View className="items-center gap-2">
              <Text className="text-white text-3xl font-extrabold text-center">
                Забули пароль?
              </Text>
              <Text className="text-white text-base text-center opacity-90 px-4">
                Введіть ваш email, і ми надішлемо вам інструкції для відновлення паролю
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View className="px-6 pt-8 pb-8">
          <Animated.View
            style={{
              opacity: fadeAnim,
            }}>
            <View className="gap-6">
              {/* Email Input */}
              <View>
                <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Email</Text>
                <View className={`bg-gray-50 border rounded-2xl px-4 py-4 flex-row items-center ${
                  error ? 'border-red-300' : 'border-gray-200'
                }`}>
                  <View className="bg-orange-100 p-2 rounded-xl mr-3">
                    <MaterialIcons name="email" size={20} color="#f97316" />
                  </View>
                  <TextInput
                    className="flex-1 text-gray-800 text-base"
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                {error && (
                  <Text className="text-red-500 text-sm mt-2 ml-1">{error}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className="bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:scale-[0.98]"
                onPress={handleSubmit}
                disabled={isLoading}>
                <Text className="text-white font-bold text-lg">
                  {isLoading ? 'Відправка...' : 'Відправити'}
                </Text>
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity
                className="items-center"
                onPress={() => router.back()}>
                <Text className="text-orange-500 font-semibold text-sm">
                  Повернутися до входу
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}


