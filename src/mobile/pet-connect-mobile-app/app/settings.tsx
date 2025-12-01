import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { useAuthStore } from '@/store';
import { platformAlert } from '@/utils/alert';

export default function SettingsScreen() {
  const router = useRouter();
  const { themeMode, colorScheme, setThemeMode, isDark } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    platformAlert.alert(
      'Вийти з акаунта',
      'Ви впевнені, що хочете вийти?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              router.replace('/(auth)/onboarding');
            } catch (error) {
              platformAlert.alert('Помилка', 'Не вдалося вийти з акаунта');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        platformAlert.alert(
          'Дозвіл потрібний',
          'Для отримання сповіщень потрібно надати дозвіл в налаштуваннях пристрою',
          [
            { text: 'Скасувати', style: 'cancel' },
            { text: 'Відкрити налаштування', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }
    setNotificationsEnabled(value);
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode);
    // No need for reload message - theme changes instantly
  };

  const handleClearCache = async () => {
    platformAlert.alert(
      'Очистити кеш',
      'Ви впевнені? Це видалить всі локальні дані застосунку.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Очистити',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              platformAlert.alert('Готово', 'Кеш очищено. Перезапустіть застосунок.');
            } catch (error) {
              platformAlert.alert('Помилка', 'Не вдалося очистити кеш');
            }
          },
        },
      ]
    );
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@petconnect.com');
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light': return '☀️ Світла';
      case 'dark': return '🌙 Темна';
      case 'system': return '📱 Системна';
    }
  };

  const getCurrentThemeDescription = () => {
    if (themeMode === 'system') {
      return `Використовується ${colorScheme === 'dark' ? 'темна' : 'світла'} (системна)`;
    }
    return getThemeLabel(themeMode);
  };

  // Dynamic colors based on theme
  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-100';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className={`flex-1 ${bgColor}`} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#78350f', '#92400e'] : ['#f59e0b', '#d97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="flex-row items-center justify-between mb-4 pt-14 px-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Налаштування</Text>
            <View className="w-10" />
          </View>

          {/* User Info Card */}
          <View className="bg-white/20 rounded-2xl p-4 flex-row items-center gap-4 border border-white/30 m-4">
            <View className="w-16 h-16 bg-white/30 rounded-full items-center justify-center">
              <MaterialIcons name="person" size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">
                {user?.name || 'Користувач'}
              </Text>
              <Text className="text-white/80">
                {user?.email || 'Не авторизовано'}
              </Text>
            </View>
            {isAuthenticated && (
              <TouchableOpacity 
                className="bg-white/20 p-2 rounded-xl"
                onPress={() => router.push('/profile')}
              >
                <MaterialIcons name="edit" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <View className="px-6 py-6 gap-6 -mt-4">
          {/* Notifications Section */}
          <View className="gap-3">
            <Text className={`text-lg font-bold ${textColor} ml-1`}>Сповіщення</Text>
            <View className={`${cardBg} rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <View className={`flex-row items-center p-4 border-b ${borderColor}`}>
                <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <MaterialIcons name="notifications" size={22} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Сповіщення</Text>
                  <Text className={`${textSecondary} text-sm`}>Отримувати push-сповіщення</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
                  thumbColor={notificationsEnabled ? '#f59e0b' : '#f4f4f5'}
                />
              </View>
              
              <View className={`flex-row items-center p-4 border-b ${borderColor}`}>
                <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <MaterialIcons name="event" size={22} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Нагадування про події</Text>
                  <Text className={`${textSecondary} text-sm`}>Сповіщення перед подіями</Text>
                </View>
                <Switch
                  value={eventReminders}
                  onValueChange={setEventReminders}
                  trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
                  thumbColor={eventReminders ? '#f59e0b' : '#f4f4f5'}
                />
              </View>
              
              <View className="flex-row items-center p-4">
                <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <MaterialIcons name="mail" size={22} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Щотижневий дайджест</Text>
                  <Text className={`${textSecondary} text-sm`}>Email зі статистикою</Text>
                </View>
                <Switch
                  value={weeklyDigest}
                  onValueChange={setWeeklyDigest}
                  trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
                  thumbColor={weeklyDigest ? '#f59e0b' : '#f4f4f5'}
                />
              </View>
            </View>
          </View>

          {/* Appearance Section */}
          <View className="gap-3">
            <Text className={`text-lg font-bold ${textColor} ml-1`}>Вигляд</Text>
            <View className={`${cardBg} rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <View className="p-4">
                <View className="flex-row items-center mb-4">
                  <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                    <MaterialIcons name="dark-mode" size={22} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className={`${textColor} font-semibold`}>Тема</Text>
                    <Text className={`${textSecondary} text-sm`}>{getCurrentThemeDescription()}</Text>
                  </View>
                </View>
                
                <View className="flex-row gap-2">
                  {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => handleThemeChange(mode)}
                      className={`flex-1 p-3 rounded-xl items-center ${
                        themeMode === mode 
                          ? 'bg-amber-500' 
                          : isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <Text className={`font-semibold ${
                        themeMode === mode 
                          ? 'text-white' 
                          : isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {getThemeLabel(mode)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Data Section */}
          <View className="gap-3">
            <Text className={`text-lg font-bold ${textColor} ml-1`}>Дані</Text>
            <View className={`${cardBg} rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <TouchableOpacity 
                onPress={() => platformAlert.alert('Скоро', 'Ця функція буде доступна пізніше')}
                className={`flex-row items-center p-4 border-b ${borderColor}`}
              >
                <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <MaterialIcons name="cloud-upload" size={22} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Експорт даних</Text>
                  <Text className={`${textSecondary} text-sm`}>Завантажити всі дані</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? '#6b7280' : '#d1d5db'} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleClearCache}
                className="flex-row items-center p-4"
              >
                <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <MaterialIcons name="cached" size={22} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Очистити кеш</Text>
                  <Text className={`${textSecondary} text-sm`}>Видалити локальні дані</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? '#6b7280' : '#d1d5db'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Section */}
          <View className="gap-3">
            <Text className={`text-lg font-bold ${textColor} ml-1`}>Допомога</Text>
            <View className={`${cardBg} rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
              <TouchableOpacity 
                onPress={() => platformAlert.alert('FAQ', 'Скоро буде доступно')}
                className={`flex-row items-center p-4 border-b ${borderColor}`}
              >
                <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <MaterialIcons name="help" size={22} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Часті питання</Text>
                  <Text className={`${textSecondary} text-sm`}>Відповіді на питання</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? '#6b7280' : '#d1d5db'} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleContact}
                className={`flex-row items-center p-4 border-b ${borderColor}`}
              >
                <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <MaterialIcons name="email" size={22} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Зв'язатися з нами</Text>
                  <Text className={`${textSecondary} text-sm`}>support@petconnect.com</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? '#6b7280' : '#d1d5db'} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => platformAlert.alert('Pet Connect', 'Версія 1.0.0\n\n© 2025 Pet Connect\nВсі права захищені')}
                className="flex-row items-center p-4"
              >
                <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                  <MaterialIcons name="info" size={22} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className={`${textColor} font-semibold`}>Про застосунок</Text>
                  <Text className={`${textSecondary} text-sm`}>Версія 1.0.0</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? '#6b7280' : '#d1d5db'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoggingOut}
            className={`${isDark ? 'bg-red-900/30' : 'bg-red-50'} border border-red-200 p-4 rounded-2xl flex-row items-center justify-center gap-3`}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#ef4444" />
            ) : (
              <>
                <MaterialIcons name="logout" size={22} color="#ef4444" />
                <Text className="text-red-500 font-bold">Вийти з акаунта</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Version Info */}
          <View className="items-center py-4">
            <Text className={`${textSecondary} text-sm`}>Pet Connect v1.0.0</Text>
            <Text className={`${isDark ? 'text-gray-600' : 'text-gray-300'} text-xs mt-1`}>© 2025 Pet Connect</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
