import React, { useEffect } from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePetsStore } from '@/store';

export default function PetProfileScreen() {
  const router = useRouter();
  const { pets, fetchPets, isLoading } = usePetsStore();
  
  useEffect(() => {
      fetchPets();
  }, []);

  const primaryPet = pets.length > 0 ? pets[0] : null;

  if (isLoading) {
      return (
          <View className="flex-1 justify-center items-center bg-white">
              <ActivityIndicator size="large" color="#f97316" />
          </View>
      );
  }

  if (!primaryPet) {
      return (
          <View className="flex-1 justify-center items-center bg-white p-6 gap-4">
              <Text className="text-xl font-bold text-gray-800 text-center">У вас ще немає улюбленців</Text>
              <Text className="text-gray-500 text-center">Додайте свого першого улюбленця, щоб побачити його профіль тут</Text>
              <TouchableOpacity 
                  onPress={() => router.push('/pets/create')}
                  className="bg-orange-500 px-6 py-3 rounded-xl"
              >
                  <Text className="text-white font-bold">Додати улюбленця</Text>
              </TouchableOpacity>
          </View>
      );
  }

  // Redirect to the detailed view of the first pet or render it here. 
  // Since we have a dedicated dynamic page, we can reuse the component or just redirect.
  // But Tabs usually expect content. I'll duplicate the render logic for now (or extract a component, but duplication is faster for this turn)
  // Actually, better to just render a summary and a button "View Full Profile" or render the full profile using the data.
  // I'll render the full profile using `primaryPet`.

  const pet = primaryPet;

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header with Pet Image */}
      <LinearGradient
        colors={['#fb923c', '#f59e0b']} // orange-400 to amber-500
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        className="rounded-b-3xl pb-8 overflow-hidden relative"
      >
        {/* Background Paw Icons */}
        <MaterialIcons name="pets" size={120} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', top: 40, left: -20, transform: [{ rotate: '-20deg' }] }} />
        <MaterialIcons name="pets" size={80} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', bottom: 20, right: -10, transform: [{ rotate: '15deg' }] }} />
        <MaterialIcons name="pets" size={60} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', top: 100, right: 40, transform: [{ rotate: '30deg' }] }} />

        <View className="flex-row justify-between items-center p-6 pt-12 relative z-10">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/pets/[id]', params: { id: pet.id } })}
            className="bg-white/20 p-2 rounded-full flex-row items-center border border-white/30 active:bg-white/30"
          >
            <MaterialIcons name="edit" size={20} color="white" />
            <Text className="text-white ml-2 font-semibold">Редагувати</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/20 p-2 rounded-full border border-white/30 active:bg-white/30">
            <MaterialIcons name="camera-alt" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="items-center px-6 gap-4 pb-4 mb-4 relative z-10">
          <View className="rounded-full border-4 border-white shadow-lg">
            <Image
              source={pet.photoUrl ? { uri: pet.photoUrl } : require('@/assets/images/pet-cat-mock-profile-image.png')}
              className="w-32 h-32 rounded-full bg-gray-200"
              style={{ width: 128, height: 128 }}
            />
          </View>

          <View className="items-center gap-1">
            <Text className="text-white text-3xl font-bold text-center">
              {pet.name}
            </Text>
            <Text className="text-white opacity-90 text-center text-lg">
              {pet.type === 'cat' ? 'Кіт' : pet.type === 'dog' ? 'Собака' : pet.type} • {pet.breed || 'Без породи'}
            </Text>

            {/* Profile Completeness */}
            <View className="items-center mt-4 w-full gap-2">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="check-circle" size={20} color="white" />
                <Text className="text-white font-semibold">Заповненість профілю</Text>
              </View>
              <View className="bg-black/20 rounded-full p-1 w-48 h-4 overflow-hidden">
                <View 
                  className="bg-white h-full rounded-full" 
                  style={{ width: `${pet.profileCompleteness || 50}%` }}
                />
              </View>
              <Text className="text-white font-bold">{pet.profileCompleteness || 50}%</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Pet Information */}
      <View className="pb-8">
        {/* Basic Information Cards - Default Background */}
        <View className="p-6 -mt-4 gap-6">
          <Text className="text-xl font-bold text-gray-800 ml-1">Основна інформація</Text>

          <View className="gap-3">
            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between border border-gray-100">
              <View className="flex-row items-center gap-4">
                <MaterialIcons name="cake" size={24} color="#f97316" />
                <View>
                  <Text className="font-bold text-gray-800">Дата народження</Text>
                  <Text className="text-gray-500">{pet.birthDate || 'Не вказано'}</Text>
                </View>
              </View>
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-700 text-xs font-bold">{pet.age || 'Вік невідомий'}</Text>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
              <MaterialIcons name="fitness-center" size={24} color="#f97316" />
              <View>
                <Text className="font-bold text-gray-800">Вага</Text>
                <Text className="text-gray-500">{pet.weight} {pet.weightUnit}</Text>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
              <MaterialIcons name="palette" size={24} color="#f97316" />
              <View>
                <Text className="font-bold text-gray-800">Колір шерсті</Text>
                <Text className="text-gray-500">{pet.color || 'Не вказано'}</Text>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
              <MaterialIcons name="transgender" size={24} color="#f97316" />
              <View>
                <Text className="font-bold text-gray-800">Стать</Text>
                <Text className="text-gray-500">{pet.gender === 'male' ? 'Хлопчик' : pet.gender === 'female' ? 'Дівчинка' : 'Невідомо'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Health Information - Gradient Background */}
        <LinearGradient
          colors={['rgba(251, 146, 60, 0.05)', 'rgba(245, 158, 11, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className=""
        >
          <View className="gap-4 py-6 px-6">
            <Text className="text-xl font-bold text-gray-800 ml-1">Здоров'я та ліки</Text>

            {/* Vaccination Status */}
            <View className="gap-3">
              <Text className="font-semibold text-gray-600 ml-1 uppercase text-xs">Вакцинації</Text>
              {pet.vaccinationStatus?.map((vaccination, index) => (
                <View key={index} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-800">{vaccination.name}</Text>
                    <Text className="text-gray-500 text-sm">{vaccination.date}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${vaccination.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-xs font-bold ${vaccination.status === 'completed' ? 'text-green-700' : 'text-orange-700'}`}>
                      {vaccination.status === 'completed' ? 'Виконано' : 'Заплановано'}
                    </Text>
                  </View>
                </View>
              ))}
               {(!pet.vaccinationStatus || pet.vaccinationStatus.length === 0) && (
                  <Text className="text-gray-400 text-center italic">Немає записів про вакцинацію</Text>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Notes - Default Background */}
        <View className="p-6 gap-4">
          <Text className="text-xl font-bold text-gray-800 ml-1">Нотатки</Text>

          <View className="flex-row flex-wrap gap-3">
            {pet.notes?.map((note, index) => (
              <View key={index} className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl w-[48%] mb-1">
                <Text className="text-gray-700 italic text-sm">
                  {note}
                </Text>
              </View>
            ))}
            <TouchableOpacity className="bg-gray-50 border border-gray-200 border-dashed p-3 rounded-xl w-[48%] items-center justify-center h-20 active:bg-gray-100">
              <MaterialIcons name="add" size={24} color="#9ca3af" />
              <Text className="text-gray-400 text-xs font-bold mt-1">Додати нотатку</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
