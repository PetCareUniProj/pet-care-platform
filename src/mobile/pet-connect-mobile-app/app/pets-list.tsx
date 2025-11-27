import React, { useEffect } from 'react';
import { Image } from 'expo-image';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { usePetsStore } from '@/store';

const PET_TYPE_EMOJI: Record<string, string> = {
  cat: '🐱',
  dog: '🐕',
  bird: '🐦',
  rabbit: '🐰',
  hamster: '🐹',
  fish: '🐠',
  other: '🐾',
};

const PET_TYPE_LABELS: Record<string, string> = {
  cat: 'Кіт',
  dog: 'Собака',
  bird: 'Птах',
  rabbit: 'Кролик',
  hamster: "Хом'як",
  fish: 'Рибка',
  other: 'Інше',
};

export default function PetsListScreen() {
  const router = useRouter();
  const { pets, fetchPets, isLoading } = usePetsStore();

  useEffect(() => {
    fetchPets();
  }, []);

  const handlePetPress = (id: string) => {
    router.push({ pathname: '/pets/[id]', params: { id } });
  };

  const handleAddPet = () => {
    router.push('/pets/create');
  };

  // Group pets by type
  const petsByType = pets.reduce((acc, pet) => {
    const type = pet.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(pet);
    return acc;
  }, {} as Record<string, typeof pets>);

  if (isLoading && pets.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

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
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Мої улюбленці</Text>
            <TouchableOpacity onPress={handleAddPet} className="p-2 -mr-2">
              <MaterialIcons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row gap-4 mt-2">
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="pets" size={20} color="white" />
                <Text className="text-white/80 text-sm">Всього</Text>
              </View>
              <Text className="text-white text-3xl font-bold">{pets.length}</Text>
            </View>
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="category" size={20} color="white" />
                <Text className="text-white/80 text-sm">Типів</Text>
              </View>
              <Text className="text-white text-3xl font-bold">{Object.keys(petsByType).length}</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-6 py-6 gap-6 -mt-4">
          {pets.length === 0 ? (
            <TouchableOpacity
              onPress={handleAddPet}
              className="bg-white border-2 border-dashed border-orange-200 rounded-2xl p-12 items-center"
            >
              <View className="bg-orange-100 w-24 h-24 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="pets" size={48} color="#f97316" />
              </View>
              <Text className="text-gray-800 font-bold text-xl">Додайте улюбленця</Text>
              <Text className="text-gray-500 text-center mt-2">
                Створіть профіль для вашого першого улюбленця
              </Text>
            </TouchableOpacity>
          ) : (
            Object.entries(petsByType).map(([type, typePets]) => (
              <View key={type} className="gap-3">
                <View className="flex-row items-center gap-2 ml-1">
                  <Text className="text-2xl">{PET_TYPE_EMOJI[type] || '🐾'}</Text>
                  <Text className="text-lg font-bold text-gray-800">
                    {PET_TYPE_LABELS[type] || type} ({typePets.length})
                  </Text>
                </View>

                {typePets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    onPress={() => handlePetPress(pet.id)}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center gap-4"
                  >
                    <View className="relative">
                      <Image
                        source={
                          pet.photoUrl
                            ? { uri: pet.photoUrl }
                            : require('@/assets/images/pet-cat-mock-profile-image.png')
                        }
                        className="w-20 h-20 rounded-2xl bg-gray-100"
                        style={{ width: 80, height: 80 }}
                      />
                      <View
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center ${
                          (pet.profileCompleteness || 0) >= 80 ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                      >
                        <MaterialIcons
                          name={(pet.profileCompleteness || 0) >= 80 ? 'check' : 'priority-high'}
                          size={14}
                          color="white"
                        />
                      </View>
                    </View>

                    <View className="flex-1">
                      <Text className="text-gray-800 font-bold text-lg">{pet.name}</Text>
                      <Text className="text-gray-500 text-sm">
                        {pet.breed || 'Порода не вказана'}
                      </Text>
                      <View className="flex-row items-center gap-4 mt-2">
                        {pet.age && (
                          <View className="flex-row items-center gap-1">
                            <MaterialIcons name="cake" size={14} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs">{pet.age}</Text>
                          </View>
                        )}
                        {pet.weight && (
                          <View className="flex-row items-center gap-1">
                            <MaterialIcons name="fitness-center" size={14} color="#9ca3af" />
                            <Text className="text-gray-400 text-xs">
                              {pet.weight} {pet.weightUnit || 'кг'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}

          {/* Add Pet Button */}
          {pets.length > 0 && (
            <TouchableOpacity
              onPress={handleAddPet}
              className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-6 flex-row items-center justify-center gap-3"
            >
              <View className="bg-orange-100 w-12 h-12 rounded-full items-center justify-center">
                <MaterialIcons name="add" size={28} color="#f97316" />
              </View>
              <View>
                <Text className="text-orange-700 font-bold">Додати улюбленця</Text>
                <Text className="text-orange-500 text-sm">Створити новий профіль</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
}

