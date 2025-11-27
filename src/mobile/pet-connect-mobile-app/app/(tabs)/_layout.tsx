import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#f97316', // orange-500
        tabBarInactiveTintColor: '#9ca3af', // gray-400
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          paddingTop: 8,
          height: 60,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tabs (redirect screen)
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Головна',
          tabBarIcon: ({ color }) => <MaterialIcons size={26} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Календар',
          tabBarIcon: ({ color }) => <MaterialIcons size={26} name="event" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Улюбленці',
          tabBarIcon: ({ color }) => <MaterialIcons size={26} name="pets" color={color} />,
        }}
      />
      <Tabs.Screen
        name="components-demo"
        options={{
          href: null, // Hide demo screen
        }}
      />
    </Tabs>
  );
}
