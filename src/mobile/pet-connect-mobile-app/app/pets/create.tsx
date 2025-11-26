import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { usePetsStore } from '@/store';
import { CreatePetDto, PetType, PetGender } from '@/types/pet.types';

export default function CreatePetScreen() {
  const router = useRouter();
  const { createPet, isLoading } = usePetsStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('cat');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<PetGender>('male');
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleCreate = async () => {
    if (!name) {
        alert('Будь ласка, введіть ім\'я улюбленця');
        return;
    }

    const newPet: CreatePetDto = {
      name,
      type,
      breed,
      gender,
      weight: weight ? parseFloat(weight) : undefined,
      weightUnit: 'kg',
      birthDate,
    };

    await createPet(newPet);
    router.back();
  };

  return (
    <>
    <Stack.Screen options={{ 
        title: 'Додати улюбленця',
        headerShown: true,
        headerTintColor: '#f97316',
        headerTitleStyle: { color: 'black' }
    }} />
    <ScrollView className="flex-1 bg-white p-6" showsVerticalScrollIndicator={false}>
      <View className="gap-6 pb-8">
        <View className="items-center mb-4">
           <View className="w-24 h-24 bg-orange-100 rounded-full items-center justify-center border-4 border-orange-200 mb-2">
              <MaterialIcons name="pets" size={40} color="#f97316" />
           </View>
           <Text className="text-xl font-bold text-gray-800">Новий друг</Text>
           <Text className="text-gray-500 text-center">Додайте інформацію про вашого улюбленця</Text>
        </View>

        {/* Name */}
        <View className="gap-2">
          <Text className="font-bold text-gray-700 ml-1">Ім'я *</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
            placeholder="Мурзик"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Type */}
        <View className="gap-2">
          <Text className="font-bold text-gray-700 ml-1">Тип тварини</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
                onPress={() => setType('cat')}
                className={`flex-1 p-4 rounded-xl border items-center gap-2 ${type === 'cat' ? 'bg-orange-50 border-orange-500' : 'bg-gray-50 border-gray-200'}`}
            >
                <MaterialIcons name="pets" size={24} color={type === 'cat' ? '#f97316' : '#9ca3af'} />
                <Text className={`font-bold ${type === 'cat' ? 'text-orange-600' : 'text-gray-500'}`}>Кіт</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setType('dog')}
                className={`flex-1 p-4 rounded-xl border items-center gap-2 ${type === 'dog' ? 'bg-orange-50 border-orange-500' : 'bg-gray-50 border-gray-200'}`}
            >
                <MaterialIcons name="pets" size={24} color={type === 'dog' ? '#f97316' : '#9ca3af'} />
                <Text className={`font-bold ${type === 'dog' ? 'text-orange-600' : 'text-gray-500'}`}>Собака</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gender */}
        <View className="gap-2">
          <Text className="font-bold text-gray-700 ml-1">Стать</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
                onPress={() => setGender('male')}
                className={`flex-1 p-4 rounded-xl border items-center ${gender === 'male' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-200'}`}
            >
                <Text className={`font-bold ${gender === 'male' ? 'text-blue-600' : 'text-gray-500'}`}>Хлопчик</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setGender('female')}
                className={`flex-1 p-4 rounded-xl border items-center ${gender === 'female' ? 'bg-pink-50 border-pink-500' : 'bg-gray-50 border-gray-200'}`}
            >
                <Text className={`font-bold ${gender === 'female' ? 'text-pink-600' : 'text-gray-500'}`}>Дівчинка</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Breed */}
        <View className="gap-2">
          <Text className="font-bold text-gray-700 ml-1">Порода</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
            placeholder="Наприклад: Мейн-кун"
            value={breed}
            onChangeText={setBreed}
          />
        </View>

        {/* Weight */}
        <View className="gap-2">
          <Text className="font-bold text-gray-700 ml-1">Вага (кг)</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
            placeholder="4.5"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
        </View>

        {/* Birth Date */}
        <View className="gap-2">
          <Text className="font-bold text-gray-700 ml-1">Дата народження</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
            placeholder="DD.MM.YYYY"
            value={birthDate}
            onChangeText={setBirthDate}
          />
        </View>

        <TouchableOpacity 
            onPress={handleCreate}
            disabled={isLoading}
            className={`mt-4 bg-orange-500 p-4 rounded-xl items-center shadow-lg shadow-orange-200 ${isLoading ? 'opacity-70' : ''}`}
        >
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white font-bold text-lg">Створити профіль</Text>
            )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </>
  );
}

