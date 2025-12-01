import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Switch, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePetsStore } from '@/store';
import { CreatePetDto, PetType, PetGender } from '@/types/pet.types';

const PET_TYPES: { type: PetType; label: string; icon: string }[] = [
  { type: 'cat', label: 'Кіт', icon: 'pets' },
  { type: 'dog', label: 'Собака', icon: 'pets' },
  { type: 'bird', label: 'Птах', icon: 'flutter-dash' },
  { type: 'rabbit', label: 'Кролик', icon: 'cruelty-free' },
  { type: 'hamster', label: 'Хом\'як', icon: 'pets' },
  { type: 'fish', label: 'Рибка', icon: 'water' },
  { type: 'other', label: 'Інше', icon: 'category' },
];

export default function CreatePetScreen() {
  const router = useRouter();
  const { createPet, isLoading } = usePetsStore();

  // Basic info
  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('cat');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<PetGender>('male');
  const [color, setColor] = useState('');
  
  // Physical characteristics
  const [weight, setWeight] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Health & identification
  const [microchip, setMicrochip] = useState('');
  const [isNeutered, setIsNeutered] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  
  // Vet info
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [vetAddress, setVetAddress] = useState('');

  // Expand sections
  const [showHealthSection, setShowHealthSection] = useState(false);
  const [showVetSection, setShowVetSection] = useState(false);

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const onDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setBirthDate(selected);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (isSubmitting || isLoading) return; // Prevent double submission
    
    if (!name.trim()) {
        alert('Будь ласка, введіть ім\'я улюбленця');
        return;
    }

    setIsSubmitting(true);

    try {
      const allergiesArray = allergies.split(',').map(a => a.trim()).filter(a => a);

    const newPet: CreatePetDto = {
        name: name.trim(),
      type,
        breed: breed.trim() || undefined,
      gender,
      weight: weight ? parseFloat(weight) : undefined,
      weightUnit: 'kg',
        birthDate: birthDate ? formatDate(birthDate) : undefined,
        color: color.trim() || undefined,
        microchip: microchip.trim() || undefined,
        isNeutered,
        allergies: allergiesArray.length > 0 ? allergiesArray : undefined,
        specialNeeds: specialNeeds.trim() || undefined,
        vetName: vetName.trim() || undefined,
        vetPhone: vetPhone.trim() || undefined,
        vetAddress: vetAddress.trim() || undefined,
    };

    await createPet(newPet);
    router.back();
    } catch (error) {
      console.error('Error creating pet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
        title: 'Додати улюбленця',
        headerShown: true,
        headerTintColor: '#f97316',
          headerTitleStyle: { color: 'black' },
        }}
      />
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <View className="p-6 gap-6 pb-8">
          {/* Header */}
          <View className="items-center mb-2">
            <LinearGradient
              colors={['#fb923c', '#f59e0b']}
              className="w-24 h-24 rounded-full items-center justify-center mb-3"
            >
              <MaterialIcons name="pets" size={44} color="white" />
            </LinearGradient>
            <Text className="text-2xl font-bold text-gray-800">Новий друг</Text>
            <Text className="text-gray-500 text-center mt-1">
              Заповніть інформацію про вашого улюбленця
            </Text>
        </View>

          {/* Section: Basic Info */}
          <View className="bg-gray-50 rounded-2xl p-4 gap-4">
            <Text className="font-bold text-gray-800 text-lg flex-row items-center">
              <MaterialIcons name="info" size={20} color="#f97316" /> Основна інформація
            </Text>

        {/* Name */}
        <View className="gap-2">
              <Text className="font-semibold text-gray-700 ml-1">
                Ім'я <Text className="text-red-500">*</Text>
              </Text>
          <TextInput
                className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                placeholder="Як звати вашого улюбленця?"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Type */}
        <View className="gap-2">
              <Text className="font-semibold text-gray-700 ml-1">Тип тварини</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {PET_TYPES.map((item) => (
            <TouchableOpacity 
                      key={item.type}
                      onPress={() => setType(item.type)}
                      className={`p-3 rounded-xl border items-center min-w-[80px] ${
                        type === item.type
                          ? 'bg-orange-50 border-orange-500'
                          : 'bg-white border-gray-200'
                      }`}
            >
                      <MaterialIcons
                        name={item.icon as any}
                        size={24}
                        color={type === item.type ? '#f97316' : '#9ca3af'}
                      />
                      <Text
                        className={`font-semibold text-sm mt-1 ${
                          type === item.type ? 'text-orange-600' : 'text-gray-500'
                        }`}
                      >
                        {item.label}
                      </Text>
            </TouchableOpacity>
                  ))}
          </View>
              </ScrollView>
        </View>

        {/* Gender */}
        <View className="gap-2">
              <Text className="font-semibold text-gray-700 ml-1">Стать</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
                onPress={() => setGender('male')}
                  className={`flex-1 p-4 rounded-xl border flex-row items-center justify-center gap-2 ${
                    gender === 'male' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'
                  }`}
            >
                  <MaterialIcons
                    name="male"
                    size={24}
                    color={gender === 'male' ? '#3b82f6' : '#9ca3af'}
                  />
                  <Text className={`font-bold ${gender === 'male' ? 'text-blue-600' : 'text-gray-500'}`}>
                    Хлопчик
                  </Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setGender('female')}
                  className={`flex-1 p-4 rounded-xl border flex-row items-center justify-center gap-2 ${
                    gender === 'female' ? 'bg-pink-50 border-pink-500' : 'bg-white border-gray-200'
                  }`}
            >
                  <MaterialIcons
                    name="female"
                    size={24}
                    color={gender === 'female' ? '#ec4899' : '#9ca3af'}
                  />
                  <Text className={`font-bold ${gender === 'female' ? 'text-pink-600' : 'text-gray-500'}`}>
                    Дівчинка
                  </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Breed */}
        <View className="gap-2">
              <Text className="font-semibold text-gray-700 ml-1">Порода</Text>
          <TextInput
                className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                placeholder="Наприклад: Мейн-кун, Лабрадор..."
            value={breed}
            onChangeText={setBreed}
          />
        </View>

            {/* Color */}
            <View className="gap-2">
              <Text className="font-semibold text-gray-700 ml-1">Колір</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                placeholder="Колір шерсті/пір'я..."
                value={color}
                onChangeText={setColor}
              />
            </View>

            {/* Birth Date */}
            <View className="gap-2">
              <Text className="font-semibold text-gray-700 ml-1">Дата народження</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center justify-between"
              >
                <Text className={birthDate ? 'text-gray-800' : 'text-gray-400'}>
                  {birthDate ? formatDate(birthDate) : 'Оберіть дату'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#9ca3af" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birthDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  themeVariant="light"
                />
              )}
            </View>

        {/* Weight */}
        <View className="gap-2">
              <Text className="font-semibold text-gray-700 ml-1">Вага (кг)</Text>
          <TextInput
                className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                placeholder="Наприклад: 4.5"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
              />
            </View>
          </View>

          {/* Section: Health & Identification */}
          <TouchableOpacity
            onPress={() => setShowHealthSection(!showHealthSection)}
            className="bg-green-50 rounded-2xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="health-and-safety" size={24} color="#22c55e" />
              <Text className="font-bold text-gray-800 text-lg">Здоров'я та ідентифікація</Text>
            </View>
            <MaterialIcons
              name={showHealthSection ? 'expand-less' : 'expand-more'}
              size={24}
              color="#9ca3af"
            />
          </TouchableOpacity>

          {showHealthSection && (
            <View className="bg-green-50/50 rounded-2xl p-4 gap-4 -mt-4">
              {/* Microchip */}
              <View className="gap-2">
                <Text className="font-semibold text-gray-700 ml-1">Номер мікрочіпа</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                  placeholder="UA123456789"
                  value={microchip}
                  onChangeText={setMicrochip}
                />
              </View>

              {/* Neutered */}
              <View className="flex-row items-center justify-between bg-white rounded-xl p-4 border border-gray-200">
                <View className="flex-row items-center gap-3">
                  <MaterialIcons name="content-cut" size={24} color="#22c55e" />
                  <Text className="font-semibold text-gray-700">Стерилізовано / кастровано</Text>
                </View>
                <Switch
                  value={isNeutered}
                  onValueChange={setIsNeutered}
                  trackColor={{ false: '#e5e7eb', true: '#bbf7d0' }}
                  thumbColor={isNeutered ? '#22c55e' : '#9ca3af'}
                />
              </View>

              {/* Allergies */}
              <View className="gap-2">
                <Text className="font-semibold text-gray-700 ml-1">Алергії</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                  placeholder="Через кому: риба, курка..."
                  value={allergies}
                  onChangeText={setAllergies}
                />
              </View>

              {/* Special Needs */}
              <View className="gap-2">
                <Text className="font-semibold text-gray-700 ml-1">Особливі потреби</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800 min-h-[80px]"
                  placeholder="Опишіть особливі потреби вашого улюбленця..."
                  multiline
                  textAlignVertical="top"
                  value={specialNeeds}
                  onChangeText={setSpecialNeeds}
                />
              </View>
            </View>
          )}

          {/* Section: Vet Info */}
          <TouchableOpacity
            onPress={() => setShowVetSection(!showVetSection)}
            className="bg-blue-50 rounded-2xl p-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="local-hospital" size={24} color="#3b82f6" />
              <Text className="font-bold text-gray-800 text-lg">Ветеринар</Text>
            </View>
            <MaterialIcons
              name={showVetSection ? 'expand-less' : 'expand-more'}
              size={24}
              color="#9ca3af"
            />
          </TouchableOpacity>

          {showVetSection && (
            <View className="bg-blue-50/50 rounded-2xl p-4 gap-4 -mt-4">
              {/* Vet Name */}
              <View className="gap-2">
                <Text className="font-semibold text-gray-700 ml-1">Назва клініки / Ім'я лікаря</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                  placeholder='Наприклад: Клініка "Добрий лікар"'
                  value={vetName}
                  onChangeText={setVetName}
          />
        </View>

              {/* Vet Phone */}
        <View className="gap-2">
                <Text className="font-semibold text-gray-700 ml-1">Телефон</Text>
          <TextInput
                  className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                  placeholder="+380 50 123 45 67"
                  keyboardType="phone-pad"
                  value={vetPhone}
                  onChangeText={setVetPhone}
          />
        </View>

              {/* Vet Address */}
              <View className="gap-2">
                <Text className="font-semibold text-gray-700 ml-1">Адреса</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
                  placeholder="вул. Хрещатик, 10, Київ"
                  value={vetAddress}
                  onChangeText={setVetAddress}
                />
              </View>
            </View>
          )}

          {/* Create Button */}
        <TouchableOpacity 
            onPress={handleCreate}
            disabled={isLoading || isSubmitting}
            className={`mt-4 rounded-xl overflow-hidden ${isLoading || isSubmitting ? 'opacity-70' : ''}`}
        >
            <LinearGradient
              colors={['#fb923c', '#f59e0b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View className="p-4 items-center flex-row justify-center gap-2">
            {isLoading ? (
                <ActivityIndicator color="white" />
            ) : (
                <>
                  <MaterialIcons name="check-circle" size={24} color="white" />
                <Text className="text-white font-bold text-lg">Створити профіль</Text>
                  </>
            )}
              </View>
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </>
  );
}
