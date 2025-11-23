// Onboarding screen

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function OnboardingScreen() {
  const handleGetStarted = () => {
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6">
        <View className="items-center mb-8">
          <Image
            source={require('@/assets/images/pet-cat-mock-profile-image.png')}
            className="w-32 h-32 rounded-full mb-6"
            style={{ width: 128, height: 128 }}
          />
          <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
            Вітаємо в Pet Connect!
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-8">
            Твій найкращий друг заслуговує на найкращий догляд
          </Text>
        </View>

        <View className="w-full mb-8">
          <View className="flex-row items-center mb-4">
            <View className="bg-yellow-400 p-3 rounded-full mr-4">
              <MaterialIcons name="favorite" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">Профілі тварин</Text>
              <Text className="text-gray-600">Створюй детальні профілі для кожного улюбленця</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="bg-yellow-400 p-3 rounded-full mr-4">
              <MaterialIcons name="notifications" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">Нагадування</Text>
              <Text className="text-gray-600">Про вакцинацію, лікування та догляд</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="bg-yellow-400 p-3 rounded-full mr-4">
              <MaterialIcons name="calendar-today" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">Календар</Text>
              <Text className="text-gray-600">Плануй візити до ветеринара та важливі події</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="bg-yellow-400 p-3 rounded-full mr-4">
              <MaterialIcons name="shopping-cart" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">Магазин</Text>
              <Text className="text-gray-600">Купуй корм, іграшки та аксесуари</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="bg-yellow-400 px-8 py-4 rounded-lg w-full"
          onPress={handleGetStarted}>
          <Text className="text-white font-semibold text-center text-lg">Почати</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


