import React from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function UnloggedHomeScreen() {
  const scrollY = new Animated.Value(0);

  return (
    <View className="flex-1 bg-white">
      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section with Parallax-like Effect */}
        <LinearGradient
          colors={['#fb923c', '#f59e0b']} // orange-400 to amber-500
          start={{ x: 1, y: 0 }} // to-l (right to left)
          end={{ x: 0, y: 0 }}
          className="rounded-b-[40px] px-6 pt-16 pb-12 mb-6"
        > 
          <View className="items-center gap-6 mt-20 mb-10">
            <View className="relative">
              <View className="absolute bg-white/20 w-32 h-32 rounded-full blur-xl" />
              <Image
                source={require('@/assets/images/pet-cat-mock-profile-image.png')}
                className="w-28 h-28 rounded-full border-4 border-white shadow-2xl"
                style={{ width: 112, height: 112 }}
              />
              <View className="absolute -bottom-2 -right-2 bg-purple-500 w-8 h-8 rounded-full border-4 border-white items-center justify-center">
                <MaterialIcons name="pets" size={14} color="white" />
              </View>
            </View>
            
            <View className="items-center gap-2">
              <Text className="text-white text-4xl font-extrabold text-center tracking-tight">
                Pet Connect
              </Text>
              <Text className="text-white text-lg text-center opacity-90 font-medium leading-6 px-8">
                Твій найкращий друг заслуговує на найкращий догляд! 🐾
              </Text>
            </View>

            <View className="flex-row gap-3 mt-2">
              <View className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                <Text className="text-white font-bold text-xs">⭐ 4.9 Рейтинг</Text>
              </View>
              <View className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                <Text className="text-white font-bold text-xs">👥 10k+ Користувачів</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Main Features */}
        <View className="px-6 gap-8 pt-8 pb-8">
          <View className="gap-2 items-center">
            <Text className="text-2xl font-bold text-gray-800 text-center">
              Що може Pet Connect?
            </Text>
            <Text className="text-center text-gray-500 text-base px-4">
              Додаток, який зробить життя твого улюбленця простішим та радіснішим
            </Text>
          </View>

          {/* Feature Cards Grid */}
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {/* Pet Profiles */}
            <View className="w-[48%] bg-white p-4 rounded-3xl border border-gray-100 shadow-sm gap-3">
              <View className="w-12 h-12 bg-orange-100 rounded-2xl items-center justify-center">
                <MaterialIcons name="pets" size={24} color="#f97316" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Профілі</Text>
                <Text className="text-gray-500 text-xs mt-1">Детальні анкети улюбленців</Text>
              </View>
            </View>

            {/* Reminders */}
            <View className="w-[48%] bg-white p-4 rounded-3xl border border-gray-100 shadow-sm gap-3">
              <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center">
                <MaterialIcons name="notifications-active" size={24} color="#3b82f6" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Нагадування</Text>
                <Text className="text-gray-500 text-xs mt-1">Вакцинації та догляд</Text>
              </View>
            </View>

            {/* Calendar */}
            <View className="w-[48%] bg-white p-4 rounded-3xl border border-gray-100 shadow-sm gap-3">
              <View className="w-12 h-12 bg-purple-100 rounded-2xl items-center justify-center">
                <MaterialIcons name="calendar-today" size={24} color="#8b5cf6" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Календар</Text>
                <Text className="text-gray-500 text-xs mt-1">Планування візитів</Text>
              </View>
            </View>

            {/* E-commerce */}
            <View className="w-[48%] bg-white p-4 rounded-3xl border border-gray-100 shadow-sm gap-3">
              <View className="w-12 h-12 bg-green-100 rounded-2xl items-center justify-center">
                <MaterialIcons name="shopping-bag" size={24} color="#10b981" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Магазин</Text>
                <Text className="text-gray-500 text-xs mt-1">Корм та аксесуари</Text>
              </View>
            </View>
          </View>

          <View className="h-[1px] bg-gray-100 my-2" />

          {/* Lifehacks Section */}
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-800">
                Корисні поради
              </Text>
              <TouchableOpacity>
                <Text className="text-orange-500 font-semibold text-sm">Всі поради</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4 -mx-6 px-6">
              <View className="w-72 bg-blue-50 p-5 rounded-3xl gap-3 mr-4">
                <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center mb-1">
                  <MaterialIcons name="directions-walk" size={20} color="white" />
                </View>
                <View>
                  <Text className="font-bold text-gray-800 text-lg mb-1">Регулярні прогулянки</Text>
                  <Text className="text-gray-600 text-sm leading-5">Щоденні прогулянки покращують фізичне та психічне здоров'я твого улюбленця</Text>
                </View>
              </View>

              <View className="w-72 bg-green-50 p-5 rounded-3xl gap-3 mr-4">
                <View className="bg-green-500 w-10 h-10 rounded-full items-center justify-center mb-1">
                  <MaterialIcons name="restaurant" size={20} color="white" />
                </View>
                <View>
                  <Text className="font-bold text-gray-800 text-lg mb-1">Правильне харчування</Text>
                  <Text className="text-gray-600 text-sm leading-5">Обери корм відповідно до віку, розміру та потреб твого улюбленця</Text>
                </View>
              </View>

              <View className="w-72 bg-purple-50 p-5 rounded-3xl gap-3 mr-4">
                <View className="bg-purple-500 w-10 h-10 rounded-full items-center justify-center mb-1">
                  <MaterialIcons name="local-hospital" size={20} color="white" />
                </View>
                <View>
                  <Text className="font-bold text-gray-800 text-lg mb-1">Регулярні огляди</Text>
                  <Text className="text-gray-600 text-sm leading-5">Відвідуй ветеринара хоча б раз на рік для профілактики</Text>
                </View>
              </View>
            </ScrollView>
          </View>

          <View className="h-[1px] bg-gray-100 my-2" />

          {/* Call to Action */}
          <View className="items-center gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <View className="items-center">
              <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                Готовий почати?
              </Text>
              <Text className="text-center text-gray-500 px-4">
                Приєднуйся до спільноти щасливих власників тварин Pet Connect!
              </Text>
            </View>
            <View className="w-full gap-3">
              <TouchableOpacity className="w-full bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-200 active:scale-[0.98]">
                <Text className="text-white font-bold text-lg">Зареєструватися</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-full bg-white border border-gray-200 py-4 rounded-2xl items-center active:bg-gray-50">
                <Text className="text-gray-700 font-bold text-lg">Увійти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
