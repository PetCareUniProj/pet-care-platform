import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Вихід з акаунту',
      'Ви впевнені, що хочете вийти?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: () => {
            // Handle logout
            router.replace('/');
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Профіль',
      items: [
        {
          icon: 'person',
          label: 'Особисті дані',
          subtitle: 'Ім\'я, email, телефон',
          action: () => {},
        },
        {
          icon: 'location-on',
          label: 'Адреси доставки',
          subtitle: '2 збережені адреси',
          action: () => {},
        },
        {
          icon: 'credit-card',
          label: 'Способи оплати',
          subtitle: 'Картки та інші методи',
          action: () => {},
        },
      ],
    },
    {
      title: 'Сповіщення',
      items: [
        {
          icon: 'notifications',
          label: 'Push-сповіщення',
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: 'alarm',
          label: 'Нагадування',
          subtitle: 'Події та процедури',
          toggle: true,
          value: reminderNotifications,
          onToggle: setReminderNotifications,
          disabled: !notificationsEnabled,
        },
        {
          icon: 'local-shipping',
          label: 'Замовлення',
          subtitle: 'Статус та доставка',
          toggle: true,
          value: orderNotifications,
          onToggle: setOrderNotifications,
          disabled: !notificationsEnabled,
        },
      ],
    },
    {
      title: 'Застосунок',
      items: [
        {
          icon: 'dark-mode',
          label: 'Темна тема',
          toggle: true,
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: 'language',
          label: 'Мова',
          subtitle: 'Українська',
          action: () => {},
        },
        {
          icon: 'storage',
          label: 'Очистити кеш',
          subtitle: '23.4 МБ',
          action: () => {
            Alert.alert('Кеш очищено', 'Всі тимчасові дані видалено');
          },
        },
      ],
    },
    {
      title: 'Підтримка',
      items: [
        {
          icon: 'help',
          label: 'Центр допомоги',
          action: () => {},
        },
        {
          icon: 'chat',
          label: 'Зв\'язатися з нами',
          action: () => {},
        },
        {
          icon: 'star',
          label: 'Оцінити застосунок',
          action: () => {},
        },
      ],
    },
    {
      title: 'Правова інформація',
      items: [
        {
          icon: 'description',
          label: 'Умови використання',
          action: () => {},
        },
        {
          icon: 'privacy-tip',
          label: 'Політика конфіденційності',
          action: () => {},
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
          colors={['#fb923c', '#f59e0b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-14 pb-8 px-6"
        >
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Налаштування</Text>
            <View className="w-10" />
          </View>

          {/* User Profile Card */}
          <View className="bg-white/20 rounded-2xl p-4 border border-white/30 flex-row items-center gap-4">
            <View className="bg-white w-16 h-16 rounded-full items-center justify-center">
              <Text className="text-orange-500 text-2xl font-bold">ОА</Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-bold">Олексій Антонов</Text>
              <Text className="text-white/80">oleksiy@example.com</Text>
            </View>
            <TouchableOpacity className="bg-white/30 p-2 rounded-full">
              <MaterialIcons name="edit" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View className="px-6 py-4 gap-6 -mt-4">
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="gap-2">
              <Text className="text-gray-500 font-semibold text-sm ml-1 uppercase">
                {section.title}
              </Text>
              <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    onPress={item.action}
                    disabled={item.toggle || item.disabled}
                    className={`flex-row items-center p-4 ${
                      itemIndex < section.items.length - 1 ? 'border-b border-gray-100' : ''
                    } ${item.disabled ? 'opacity-50' : ''}`}
                  >
                    <View className="bg-orange-100 w-10 h-10 rounded-xl items-center justify-center mr-4">
                      <MaterialIcons name={item.icon as any} size={22} color="#f97316" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-semibold">{item.label}</Text>
                      {item.subtitle && (
                        <Text className="text-gray-500 text-sm">{item.subtitle}</Text>
                      )}
                    </View>
                    {item.toggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        disabled={item.disabled}
                        trackColor={{ false: '#e5e7eb', true: '#fdba74' }}
                        thumbColor={item.value ? '#f97316' : '#9ca3af'}
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
            onPress={handleLogout}
            className="bg-red-50 border border-red-100 rounded-2xl p-4 flex-row items-center justify-center gap-2"
          >
            <MaterialIcons name="logout" size={22} color="#ef4444" />
            <Text className="text-red-500 font-bold">Вийти з акаунту</Text>
          </TouchableOpacity>

          {/* App Version */}
          <View className="items-center py-4">
            <Text className="text-gray-400 text-sm">Pet Connect v1.0.0</Text>
            <Text className="text-gray-300 text-xs">© 2025 Pet Connect</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

