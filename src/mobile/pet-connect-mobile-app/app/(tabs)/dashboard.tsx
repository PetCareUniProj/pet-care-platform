import React from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data for pets
const mockPets = [
  {
    id: '1',
    name: 'Мурзик',
    type: 'Кіт',
    age: '2 роки',
    breed: 'Британська короткошерста',
    image: require('@/assets/images/pet-cat-mock-profile-image.png'),
    nextVaccination: '15.11.2025',
    nextVetVisit: '20.11.2025',
    status: 'healthy'
  },
  {
    id: '2',
    name: 'Барон',
    type: 'Собака',
    age: '4 роки',
    breed: 'Лабрадор',
    image: require('@/assets/images/pet-cat-mock-profile-image.png'),
    nextVaccination: '10.12.2025',
    nextVetVisit: '05.12.2025',
    status: 'needs_attention'
  }
];

// Quick Actions Menu
const quickActions = [
  { id: '1', title: 'Запис', icon: 'calendar-today', color: '#3b82f6', bg: 'bg-blue-100' },
  { id: '2', title: 'Ліки', icon: 'medication', color: '#ef4444', bg: 'bg-red-100' },
  { id: '3', title: 'Щеплення', icon: 'local-hospital', color: '#10b981', bg: 'bg-green-100' },
  { id: '4', title: 'Догляд', icon: 'content-cut', color: '#f59e0b', bg: 'bg-amber-100' },
  { id: '5', title: 'Прогулянка', icon: 'directions-walk', color: '#8b5cf6', bg: 'bg-violet-100' },
  { id: '6', title: 'Вага', icon: 'fitness-center', color: '#06b6d4', bg: 'bg-cyan-100' },
  { id: '7', title: 'Харчування', icon: 'restaurant', color: '#f97316', bg: 'bg-orange-100' },
  { id: '8', title: 'Документи', icon: 'description', color: '#6b7280', bg: 'bg-gray-100' },
];

export default function LoggedHomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#fb923c', '#f59e0b']} // orange-400 to amber-500
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        className="rounded-b-3xl"
      >
        <View className="flex-row justify-between items-center mt-20 pb-6 px-6">
          <View>
            <Text className="text-white text-2xl font-bold">
              Вітаємо, Олексій! 👋
            </Text>
            <Text className="text-white opacity-90 mt-1">
              Як почуваються твої улюбленці сьогодні?
            </Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border-2 border-white/30">
            <Text className="text-white font-bold text-lg">ОА</Text>
          </View>
        </View>

        {/* Quick Actions Grid in Header */}
        <View className="flex-row flex-wrap justify-between gap-y-4 pb-6">
          {quickActions.slice(0, 4).map((action) => (
            <TouchableOpacity key={action.id} className="items-center w-[22%]">
              <View className={`w-12 h-12 rounded-2xl items-center justify-center ${action.bg} shadow-sm mb-1`}>
                <MaterialIcons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text className="text-white text-xs font-medium text-center">{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View className="px-6 pt-6 gap-6 pb-8">
        
        {/* Extended Quick Actions (More Options) */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-800 ml-1">Меню</Text>
            <TouchableOpacity>
              <Text className="text-orange-500 font-semibold text-xs">Всі функції</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-3">
            {quickActions.slice(4).map((action) => (
              <TouchableOpacity key={action.id} className="flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-100 w-[48%] active:bg-gray-100">
                <View className={`w-8 h-8 rounded-full items-center justify-center ${action.bg} mr-3`}>
                  <MaterialIcons name={action.icon as any} size={16} color={action.color} />
                </View>
                <Text className="text-gray-700 font-medium text-sm">{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pets Dashboard */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-800 ml-1">Твої улюбленці</Text>
            <TouchableOpacity>
              <Text className="text-orange-500 font-semibold text-xs">Додати</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {mockPets.map((pet) => (
              <View key={pet.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex-row items-center gap-4">
                <Image
                  source={pet.image}
                  className="w-16 h-16 rounded-full bg-gray-100"
                />

                <View className="flex-1 gap-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-gray-800">{pet.name}</Text>
                    <View className={`px-2 py-1 rounded-full ${pet.status === 'healthy' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <Text className={`text-xs font-bold ${pet.status === 'healthy' ? 'text-green-700' : 'text-orange-700'}`}>
                        {pet.status === 'healthy' ? 'Здоровий' : 'Потрібна увага'}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-gray-500 text-sm">
                    {pet.type} • {pet.age} • {pet.breed}
                  </Text>

                  <View className="flex-row items-center gap-1 mt-1">
                    <MaterialIcons name="local-hospital" size={16} color="#f97316" />
                    <Text className="text-xs text-gray-500">
                      Вакцинація: {pet.nextVaccination}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View className="gap-3">
          <Text className="text-lg font-bold text-gray-800 ml-1">Найближчі події</Text>

          <View className="gap-3">
            <View className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex-row items-center gap-4">
              <View className="bg-orange-100 p-3 rounded-full">
                <MaterialIcons name="local-hospital" size={24} color="#f97316" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800">Вакцинація Мурзика</Text>
                <Text className="text-gray-600 text-sm">15 листопада 2025 • 10:00</Text>
              </View>
              <View className="bg-orange-200 px-2 py-1 rounded">
                <Text className="text-orange-800 text-xs font-bold">Через 5 днів</Text>
              </View>
            </View>

            <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex-row items-center gap-4">
              <View className="bg-blue-100 p-3 rounded-full">
                <MaterialIcons name="calendar-today" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800">Візит до ветеринара</Text>
                <Text className="text-gray-600 text-sm">20 листопада 2025 • 14:30</Text>
              </View>
              <View className="bg-blue-200 px-2 py-1 rounded">
                <Text className="text-blue-800 text-xs font-bold">Через 10 днів</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
