// Profile Edit Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, isLoading, updateProfile, openAccountSettings } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Помилка', "Введіть ім'я");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });
      Alert.alert('Готово', 'Профіль оновлено');
      router.back();
    } catch (error: any) {
      if (error.message?.includes('сторінку налаштувань')) {
        // User was redirected to Keycloak account page
        Alert.alert('Інформація', 'Відкрито сторінку налаштувань акаунту в браузері');
      } else {
        Alert.alert('Помилка', error.message || 'Не вдалося оновити профіль');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAccountSettings = async () => {
    try {
      await openAccountSettings();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося відкрити налаштування');
    }
  };

  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-200';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className={`flex-1 ${bgColor}`}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#78350f', '#92400e'] : ['#f59e0b', '#d97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="flex-row items-center justify-between pt-14 pb-6 px-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Редагування профілю</Text>
            <View className="w-10" />
          </View>
        </LinearGradient>

        <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View className="items-center mb-6">
            <View className={`w-24 h-24 ${isDark ? 'bg-gray-700' : 'bg-amber-100'} rounded-full items-center justify-center mb-3`}>
              <MaterialIcons name="person" size={48} color={isDark ? '#fbbf24' : '#f59e0b'} />
            </View>
            <Text className={`${textColor} text-lg font-bold`}>
              {user?.name || `${firstName} ${lastName}`.trim() || 'Користувач'}
            </Text>
            <Text className={textSecondary}>{email}</Text>
          </View>

          {/* Form */}
          <View className={`${cardBg} rounded-2xl p-5 gap-4 mb-6`}>
            {/* First Name */}
            <View>
              <Text className={`${textColor} font-medium mb-2`}>Ім'я</Text>
              <TextInput
                className={`${inputBg} ${textColor} border ${inputBorder} rounded-xl px-4 py-3`}
                placeholder="Ваше ім'я"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                value={firstName}
                onChangeText={setFirstName}
                editable={!isSaving}
              />
            </View>

            {/* Last Name */}
            <View>
              <Text className={`${textColor} font-medium mb-2`}>Прізвище</Text>
              <TextInput
                className={`${inputBg} ${textColor} border ${inputBorder} rounded-xl px-4 py-3`}
                placeholder="Ваше прізвище"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                value={lastName}
                onChangeText={setLastName}
                editable={!isSaving}
              />
            </View>

            {/* Email */}
            <View>
              <Text className={`${textColor} font-medium mb-2`}>Email</Text>
              <TextInput
                className={`${inputBg} ${textColor} border ${inputBorder} rounded-xl px-4 py-3`}
                placeholder="your@email.com"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSaving}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            className="bg-orange-500 py-4 rounded-xl items-center mb-4"
            onPress={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Зберегти зміни</Text>
            )}
          </TouchableOpacity>

          {/* Open Account Settings */}
          <TouchableOpacity
            className={`${cardBg} border ${inputBorder} py-4 rounded-xl items-center flex-row justify-center gap-2`}
            onPress={handleOpenAccountSettings}
            disabled={isSaving}
          >
            <MaterialIcons name="open-in-new" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className={textSecondary}>Відкрити повні налаштування акаунту</Text>
          </TouchableOpacity>

          {/* Info */}
          <View className="mt-6 p-4 bg-blue-50 rounded-xl">
            <View className="flex-row items-start gap-3">
              <MaterialIcons name="info-outline" size={20} color="#3b82f6" />
              <Text className="flex-1 text-blue-700 text-sm">
                Для зміни пароля або інших налаштувань безпеки скористайтесь повними налаштуваннями акаунту
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}


