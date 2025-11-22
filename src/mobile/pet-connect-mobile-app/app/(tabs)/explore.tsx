import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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

export default function LoggedHomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-yellow-400 p-6 rounded-b-3xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xl font-bold text-white">
              Вітаємо, Олексій! 👋
            </Text>
            <Text className="text-white opacity-90">
              Як почуваються твої улюбленці сьогодні?
            </Text>
          </View>
          <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
            <Text className="text-lg font-bold text-yellow-400">ОА</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="p-6 -mt-6">
        <View>
          <Text className="text-lg font-bold text-gray-800 mb-4">Швидкі дії</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="bg-yellow-400 px-4 py-3 rounded-lg flex-1 mr-2 items-center">
              <MaterialIcons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Додати тваринку</Text>
            </TouchableOpacity>
            <TouchableOpacity className="border border-gray-300 px-4 py-3 rounded-lg flex-1 ml-2 items-center">
              <MaterialIcons name="calendar-today" size={20} color="#374151" />
              <Text className="text-gray-700 font-semibold ml-2">Записатися</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pets Dashboard */}
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">Твої улюбленці</Text>
            <TouchableOpacity>
              <Text className="text-yellow-600 font-semibold">Переглянути всі</Text>
            </TouchableOpacity>
          </View>

          <View>
            {mockPets.map((pet) => (
              <View key={pet.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-3">
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mr-3">
                    <Text className="text-lg font-bold text-gray-600">{pet.name.charAt(0)}</Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-lg font-semibold text-gray-800">{pet.name}</Text>
                      <View className={`px-2 py-1 rounded-full ${pet.status === 'healthy' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        <Text className={`text-xs font-semibold ${pet.status === 'healthy' ? 'text-green-700' : 'text-yellow-700'}`}>
                          {pet.status === 'healthy' ? 'Здоровий' : 'Потрібна увага'}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-gray-600 text-sm">
                      {pet.type} • {pet.age} • {pet.breed}
                    </Text>

                    <View className="flex-row items-center mt-2">
                      <MaterialIcons name="local-hospital" size={16} color="#fbbf24" />
                      <Text className="text-xs text-gray-500 ml-1">
                        Вакцинація: {pet.nextVaccination}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        <View>
          <Text className="text-lg font-bold text-gray-800 mb-4">Найближчі події</Text>

          <View>
            <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-3">
              <View className="flex-row items-center">
                <View className="bg-yellow-400 p-2 rounded-full mr-3">
                  <MaterialIcons name="local-hospital" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Вакцинація Мурзика</Text>
                  <Text className="text-gray-600 text-sm">15 листопада 2025 • 10:00</Text>
                </View>
                <View className="bg-yellow-500 px-2 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-white">Через 5 днів</Text>
                </View>
              </View>
            </View>

            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <View className="flex-row items-center">
                <View className="bg-blue-400 p-2 rounded-full mr-3">
                  <MaterialIcons name="calendar-today" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Візит до ветеринара</Text>
                  <Text className="text-gray-600 text-sm">20 листопада 2025 • 14:30</Text>
                </View>
                <View className="bg-blue-500 px-2 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-white">Через 10 днів</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Navigation */}
        <View>
          <Text className="text-lg font-bold text-gray-800 mb-4">Навігація</Text>

          <View>
            <TouchableOpacity className="border border-gray-300 rounded-lg p-4 mb-3 justify-start">
              <View className="flex-row items-center">
                <MaterialIcons name="notifications" size={24} color="#fbbf24" />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-800 font-semibold">Нагадування</Text>
                  <Text className="text-gray-600 text-sm">Управляй нагадуваннями про догляд</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="border border-gray-300 rounded-lg p-4 mb-3 justify-start">
              <View className="flex-row items-center">
                <MaterialIcons name="shopping-cart" size={24} color="#fbbf24" />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-800 font-semibold">Магазин</Text>
                  <Text className="text-gray-600 text-sm">Купуй товари для улюбленців</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="border border-gray-300 rounded-lg p-4 justify-start">
              <View className="flex-row items-center">
                <MaterialIcons name="person" size={24} color="#fbbf24" />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-800 font-semibold">Профіль</Text>
                  <Text className="text-gray-600 text-sm">Налаштування профілю</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
