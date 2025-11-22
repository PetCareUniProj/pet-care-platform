import { Image } from 'expo-image';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function UnloggedHomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <View className="bg-yellow-400 p-6 rounded-b-3xl">
        <View className="py-8 items-center">
          <View className="items-center">
            <Image
              source={require('@/assets/images/pet-cat-mock-profile-image.png')}
              className="w-24 h-24 rounded-full border-4 border-white"
              style={{ width: 96, height: 96 }}
            />
            <Text className="text-3xl font-bold text-white text-center mt-4">
              Pet Connect
            </Text>
            <Text className="text-white text-center text-lg mt-2">
              Твій найкращий друг заслуговує на найкращий догляд! 🐾
            </Text>
          </View>
        </View>
      </View>

      {/* Main Features */}
      <View className="p-6">
        <View className="mb-6">
          <Text className="text-xl font-bold text-center text-gray-800 mb-2">
            Що може Pet Connect?
          </Text>
          <Text className="text-center text-gray-600">
            Додаток, який зробить життя твого улюбленця простішим та радіснішим
          </Text>
        </View>

        {/* Feature Cards */}
        <View>
          {/* Pet Profiles */}
          <View className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-3">
            <View className="flex-row items-center">
              <View className="bg-yellow-400 p-3 rounded-full mr-3">
                <MaterialIcons name="favorite" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">Профілі тварин</Text>
                <Text className="text-gray-600">Створюй детальні профілі для кожного улюбленця</Text>
              </View>
              <MaterialIcons name="check-circle" size={20} color="#fbbf24" />
            </View>
          </View>

          {/* Reminders */}
          <View className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-3">
            <View className="flex-row items-center">
              <View className="bg-yellow-400 p-3 rounded-full mr-3">
                <MaterialIcons name="notifications" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">Нагадування</Text>
                <Text className="text-gray-600">Про вакцинацію, лікування та догляд</Text>
              </View>
              <MaterialIcons name="check-circle" size={20} color="#fbbf24" />
            </View>
          </View>

          {/* Calendar */}
          <View className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200 mb-3">
            <View className="flex-row items-center">
              <View className="bg-yellow-400 p-3 rounded-full mr-3">
                <MaterialIcons name="calendar-today" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">Календар</Text>
                <Text className="text-gray-600">Плануй візити до ветеринара та важливі події</Text>
              </View>
              <MaterialIcons name="check-circle" size={20} color="#fbbf24" />
            </View>
          </View>

          {/* E-commerce */}
          <View className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
            <View className="flex-row items-center">
              <View className="bg-yellow-400 p-3 rounded-full mr-3">
                <MaterialIcons name="shopping-cart" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">Магазин</Text>
                <Text className="text-gray-600">Купуй корм, іграшки та аксесуари</Text>
              </View>
              <MaterialIcons name="check-circle" size={20} color="#fbbf24" />
            </View>
          </View>
        </View>

        <View className="h-0.5 bg-gray-200 my-4" />

        {/* Lifehacks Section */}
        <View>
          <Text className="text-xl font-bold text-center text-gray-800 mb-4">
            🌟 Життєві хаки для власників тварин
          </Text>

          <View>
            <View className="bg-blue-50 p-4 rounded-xl mb-3">
              <View className="flex-row items-start">
                <View className="bg-blue-500 px-2 py-1 rounded-full mr-3">
                  <Text className="text-xs font-bold text-white">Хак #1</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Регулярні прогулянки</Text>
                  <Text className="text-gray-600 text-sm">Щоденні прогулянки покращують фізичне та психічне здоров&apos;я твого улюбленця</Text>
                </View>
              </View>
            </View>

            <View className="bg-green-50 p-4 rounded-xl mb-3">
              <View className="flex-row items-start">
                <View className="bg-green-500 px-2 py-1 rounded-full mr-3">
                  <Text className="text-xs font-bold text-white">Хак #2</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Правильне харчування</Text>
                  <Text className="text-gray-600 text-sm">Обери корм відповідно до віку, розміру та потреб твого улюбленця</Text>
                </View>
              </View>
            </View>

            <View className="bg-purple-50 p-4 rounded-xl">
              <View className="flex-row items-start">
                <View className="bg-purple-500 px-2 py-1 rounded-full mr-3">
                  <Text className="text-xs font-bold text-white">Хак #3</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Регулярні огляди</Text>
                  <Text className="text-gray-600 text-sm">Відвідуй ветеринара хоча б раз на рік для профілактики</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="h-0.5 bg-gray-200 my-4" />

        {/* Call to Action */}
        <View className="items-center py-4">
          <Text className="text-lg font-bold text-center text-gray-800 mb-2">
            Готовий почати?
          </Text>
          <Text className="text-center text-gray-600 mb-4">
            Приєднуйся до тисяч власників тварин, які вже використовують Pet Connect!
          </Text>
          <View className="flex-row">
            <TouchableOpacity className="bg-yellow-400 px-6 py-3 rounded-lg mr-3">
              <Text className="text-white font-semibold">Зареєструватися</Text>
            </TouchableOpacity>
            <TouchableOpacity className="border border-gray-300 px-6 py-3 rounded-lg">
              <Text className="text-gray-700">Увійти</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
