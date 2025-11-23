import React from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

// Mock pet data
const mockPetData = {
  id: '1',
  name: 'Мурзик',
  type: 'Кіт',
  breed: 'Британська короткошерста',
  age: '2 роки 3 місяці',
  gender: 'Хлопчик',
  weight: '4.8 кг',
  color: 'Сірий з білим',
  birthDate: '15.08.2023',
  microchip: 'UA123456789',
  owner: 'Олексій Петренко',
  vet: 'Ветеринарна клініка "Добрий лікар"',
  vetPhone: '+380 50 123 45 67',
  image: require('@/assets/images/pet-cat-mock-profile-image.png'),
  profileCompleteness: 85,
  vaccinationStatus: [
    { name: 'Комплексна вакцинація', date: '15.10.2025', status: 'completed' },
    { name: 'Рабієс', date: '15.10.2025', status: 'completed' },
    { name: 'Лейкемія кішок', date: '15.10.2024', status: 'completed' },
    { name: 'Наступна вакцинація', date: '15.11.2025', status: 'upcoming' }
  ],
  medications: [
    { name: 'Протипаразитарний препарат', dosage: '1 таблетка', frequency: 'Щомісяця', nextDate: '01.12.2025' }
  ],
  upcomingAppointments: [
    { type: 'Вакцинація', date: '15.11.2025', time: '10:00', vet: 'Др. Сидоренко' },
    { type: 'Огляд', date: '20.11.2025', time: '14:30', vet: 'Др. Сидоренко' }
  ],
  notes: [
    'Мурзик любить гратися з іграшками на мотузці.',
    'Має алергію на рибу.',
    'Любить спати на підвіконні.',
    'Боїться пилососа.'
  ]
};

export default function PetProfileScreen() {
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
          <TouchableOpacity className="bg-white/20 p-2 rounded-full flex-row items-center border border-white/30 active:bg-white/30">
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
              source={mockPetData.image}
              className="w-32 h-32 rounded-full bg-gray-200"
              style={{ width: 128, height: 128 }}
            />
          </View>

          <View className="items-center gap-1">
            <Text className="text-white text-3xl font-bold text-center">
              {mockPetData.name}
            </Text>
            <Text className="text-white opacity-90 text-center text-lg">
              {mockPetData.type} • {mockPetData.breed}
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
                  style={{ width: `${mockPetData.profileCompleteness}%` }}
                />
              </View>
              <Text className="text-white font-bold">{mockPetData.profileCompleteness}%</Text>
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
                  <Text className="text-gray-500">{mockPetData.birthDate}</Text>
                </View>
              </View>
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-700 text-xs font-bold">{mockPetData.age}</Text>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
              <MaterialIcons name="fitness-center" size={24} color="#f97316" />
              <View>
                <Text className="font-bold text-gray-800">Вага</Text>
                <Text className="text-gray-500">{mockPetData.weight}</Text>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
              <MaterialIcons name="palette" size={24} color="#f97316" />
              <View>
                <Text className="font-bold text-gray-800">Колір шерсті</Text>
                <Text className="text-gray-500">{mockPetData.color}</Text>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
              <MaterialIcons name="transgender" size={24} color="#f97316" />
              <View>
                <Text className="font-bold text-gray-800">Стать</Text>
                <Text className="text-gray-500">{mockPetData.gender}</Text>
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
              {mockPetData.vaccinationStatus.map((vaccination, index) => (
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
            </View>

            {/* Medications */}
            <View className="gap-3 mt-2">
              <Text className="font-semibold text-gray-600 ml-1 uppercase text-xs">Ліки</Text>
              {mockPetData.medications.map((medication, index) => (
                <View key={index} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex-row items-center gap-4">
                  <View className="bg-orange-100 p-2 rounded-full">
                    <MaterialIcons name="medication" size={24} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-800">{medication.name}</Text>
                    <Text className="text-gray-600 text-sm">
                      {medication.dosage} • {medication.frequency}
                    </Text>
                    <Text className="text-orange-600 text-xs font-semibold mt-1">
                      Наступний прийом: {medication.nextDate}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Upcoming Appointments - Default Background */}
        <View className="p-6 gap-6">
          <View className="gap-4">
            <Text className="text-xl font-bold text-gray-800 ml-1">Найближчі візити</Text>

            <View className="gap-3">
              {mockPetData.upcomingAppointments.map((appointment, index) => (
                <View key={index} className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex-row items-start gap-4">
                  <View className="bg-blue-100 p-2 rounded-full">
                    <MaterialIcons name="calendar-today" size={24} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-gray-800">{appointment.type}</Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      {appointment.date} • {appointment.time}
                    </Text>
                    <Text className="text-blue-600 text-xs font-semibold mt-1">{appointment.vet}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Veterinary Information - Gradient Background */}
        <LinearGradient
          colors={['rgba(251, 146, 60, 0.05)', 'rgba(245, 158, 11, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className=""
        >
          <View className="gap-4 py-6 px-6">
            <Text className="text-xl font-bold text-gray-800 ml-1">Ветеринар</Text>

            <View className="bg-white border border-green-100 p-4 rounded-2xl gap-3 shadow-sm">
              <View className="flex-row items-center gap-3">
                <View className="bg-green-100 p-2 rounded-full">
                  <MaterialIcons name="location-on" size={24} color="#10b981" />
                </View>
                <Text className="font-bold text-gray-800 flex-1">
                  {mockPetData.vet}
                </Text>
              </View>
              <View className="h-[1px] bg-green-50" />
              <View className="flex-row items-center gap-3">
                <View className="bg-green-100 p-2 rounded-full">
                  <MaterialIcons name="phone" size={24} color="#10b981" />
                </View>
                <Text className="text-gray-700 font-semibold">{mockPetData.vetPhone}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Notes - Default Background */}
        <View className="p-6 gap-4">
          <Text className="text-xl font-bold text-gray-800 ml-1">Нотатки</Text>

          <View className="flex-row flex-wrap gap-3">
            {mockPetData.notes.map((note, index) => (
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
