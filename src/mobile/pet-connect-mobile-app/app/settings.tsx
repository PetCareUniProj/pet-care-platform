import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
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

  const handleClearCache = async () => {
    Alert.alert(
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
              Alert.alert('Готово', 'Кеш очищено. Перезапустіть застосунок.');
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося очистити кеш');
            }
          },
        },
      ]
    );
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@petconnect.com');
  };

  const settingSections = [
    {
      title: 'Сповіщення',
      items: [
        {
          icon: 'notifications',
          label: 'Сповіщення',
          description: 'Отримувати push-сповіщення',
          type: 'switch',
          value: notificationsEnabled,
          onValueChange: handleToggleNotifications,
        },
        {
          icon: 'event',
          label: 'Нагадування про події',
          description: 'Сповіщення перед подіями',
          type: 'switch',
          value: eventReminders,
          onValueChange: setEventReminders,
        },
        {
          icon: 'mail',
          label: 'Щотижневий дайджест',
          description: 'Email зі статистикою',
          type: 'switch',
          value: weeklyDigest,
          onValueChange: setWeeklyDigest,
        },
      ],
    },
    {
      title: 'Вигляд',
      items: [
        {
          icon: 'dark-mode',
          label: 'Темна тема',
          description: 'Скоро буде доступна',
          type: 'switch',
          value: darkMode,
          onValueChange: setDarkMode,
          disabled: true,
        },
      ],
    },
    {
      title: 'Дані',
      items: [
        {
          icon: 'cloud-upload',
          label: 'Експорт даних',
          description: 'Завантажити всі дані',
          type: 'action',
          onPress: () => Alert.alert('Скоро', 'Ця функція буде доступна пізніше'),
        },
        {
          icon: 'cached',
          label: 'Очистити кеш',
          description: 'Видалити локальні дані',
          type: 'action',
          onPress: handleClearCache,
        },
      ],
    },
    {
      title: 'Допомога',
      items: [
        {
          icon: 'help',
          label: 'Часті питання',
          description: 'Відповіді на питання',
          type: 'action',
          onPress: () => Alert.alert('FAQ', 'Скоро буде доступно'),
        },
        {
          icon: 'email',
          label: 'Зв\'язатися з нами',
          description: 'support@petconnect.com',
          type: 'action',
          onPress: handleContact,
        },
        {
          icon: 'info',
          label: 'Про застосунок',
          description: 'Версія 1.0.0',
          type: 'action',
          onPress: () => Alert.alert('Pet Connect', 'Версія 1.0.0\n\n© 2025 Pet Connect\nВсі права захищені'),
        },
      ],
    },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#f59e0b', '#d97706']}
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
              <Text className="text-white font-bold text-lg">Користувач</Text>
              <Text className="text-white/80">user@example.com</Text>
            </View>
            <TouchableOpacity className="bg-white/20 p-2 rounded-xl">
              <MaterialIcons name="edit" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View className="px-6 py-6 gap-6 -mt-4">
          {settingSections.map((section) => (
            <View key={section.title} className="gap-3">
              <Text className="text-lg font-bold text-gray-800 ml-1">{section.title}</Text>
              <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={item.type === 'action' ? (item as any).onPress : undefined}
                    disabled={item.type === 'switch' ? (item as any).disabled : false}
                    className={`flex-row items-center p-4 ${
                      index < section.items.length - 1 ? 'border-b border-gray-100' : ''
                    } ${item.type === 'switch' && (item as any).disabled ? 'opacity-50' : ''}`}
                  >
                    <View className="bg-amber-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                      <MaterialIcons name={item.icon as any} size={22} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-semibold">{item.label}</Text>
                      <Text className="text-gray-500 text-sm">{item.description}</Text>
                    </View>
                    {item.type === 'switch' ? (
                      <Switch
                        value={(item as any).value}
                        onValueChange={(item as any).onValueChange}
                        disabled={(item as any).disabled}
                        trackColor={{ false: '#d1d5db', true: '#fbbf24' }}
                        thumbColor={(item as any).value ? '#f59e0b' : '#f4f4f5'}
                      />
                    ) : (
                      <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={() => Alert.alert('Вихід', 'Функція буде доступна пізніше')}
            className="bg-red-50 border border-red-200 p-4 rounded-2xl flex-row items-center justify-center gap-3"
          >
            <MaterialIcons name="logout" size={22} color="#ef4444" />
            <Text className="text-red-500 font-bold">Вийти з акаунта</Text>
          </TouchableOpacity>

          {/* Version Info */}
          <View className="items-center py-4">
            <Text className="text-gray-400 text-sm">Pet Connect v1.0.0</Text>
            <Text className="text-gray-300 text-xs mt-1">© 2025 Pet Connect</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
