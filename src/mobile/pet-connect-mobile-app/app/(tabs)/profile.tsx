import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
  healthScore: 85,
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
  notes: 'Мурзик любить гратися з іграшками на мотузці. Має алергію на рибу. Любить спати на підвіконні.'
};

export default function PetProfileScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header with Pet Image */}
      <View className="bg-yellow-400 pb-6 rounded-b-3xl">
        <View className="flex-row justify-between items-center p-6 pt-12">
          <TouchableOpacity className="border border-white px-3 py-2 rounded-lg">
            <View className="flex-row items-center">
              <MaterialIcons name="edit" size={16} color="white" />
              <Text className="text-white ml-2">Редагувати</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="border border-white p-2 rounded-lg">
            <MaterialIcons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="items-center px-6">
          <View className="w-32 h-32 bg-white rounded-full border-4 border-white items-center justify-center">
            <Text className="text-6xl font-bold text-yellow-400">{mockPetData.name.charAt(0)}</Text>
          </View>

          <View className="items-center mt-4">
            <Text className="text-3xl font-bold text-white text-center">
              {mockPetData.name}
            </Text>
            <Text className="text-white opacity-90 text-center">
              {mockPetData.type} • {mockPetData.breed}
            </Text>

            {/* Health Score */}
            <View className="items-center mt-4 w-full">
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="favorite" size={24} color="white" />
                <Text className="text-white font-semibold ml-2">Рівень здоров&apos;я</Text>
              </View>
              <View className="bg-white/20 rounded-full p-1 w-32 h-3">
                <View className="bg-white rounded-full h-1" style={{width: `${mockPetData.healthScore}%`}} />
              </View>
              <Text className="text-white text-sm mt-1">{mockPetData.healthScore}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Pet Information */}
      <View className="p-6 -mt-6">
        {/* Basic Information */}
        <View>
          <Text className="text-xl font-bold text-gray-800 mb-4">Основна інформація</Text>

          <View>
            <View className="bg-gray-50 p-4 rounded-xl mb-3">
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <MaterialIcons name="calendar-today" size={24} color="#fbbf24" />
                  <View className="ml-3">
                    <Text className="font-semibold text-gray-800">Дата народження</Text>
                    <Text className="text-gray-600 text-sm">{mockPetData.birthDate}</Text>
                  </View>
                </View>
                <View className="bg-gray-200 px-2 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-gray-700">{mockPetData.age}</Text>
                </View>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-xl mb-3">
              <View className="flex-row items-center">
                <MaterialIcons name="fitness-center" size={24} color="#fbbf24" />
                <View className="ml-3">
                  <Text className="font-semibold text-gray-800">Вага</Text>
                  <Text className="text-gray-600 text-sm">{mockPetData.weight}</Text>
                </View>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-xl mb-3">
              <View className="flex-row items-center">
                <MaterialIcons name="straighten" size={24} color="#fbbf24" />
                <View className="ml-3">
                  <Text className="font-semibold text-gray-800">Колір шерсті</Text>
                  <Text className="text-gray-600 text-sm">{mockPetData.color}</Text>
                </View>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-xl">
              <View className="flex-row items-center">
                <MaterialIcons name="star" size={24} color="#fbbf24" />
                <View className="ml-3">
                  <Text className="font-semibold text-gray-800">Стать</Text>
                  <Text className="text-gray-600 text-sm">{mockPetData.gender}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="h-0.5 bg-gray-200 my-4" />

        {/* Health Information */}
        <View>
          <Text className="text-xl font-bold text-gray-800 mb-4">Здоров&apos;я</Text>

          {/* Vaccination Status */}
          <View>
            <Text className="font-semibold text-gray-700 mb-2">Вакцинації</Text>
            {mockPetData.vaccinationStatus.map((vaccination, index) => (
              <View key={index} className="bg-white border border-gray-200 p-4 rounded-xl mb-3">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">{vaccination.name}</Text>
                    <Text className="text-gray-600 text-sm">{vaccination.date}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${vaccination.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <Text className={`text-xs font-semibold ${vaccination.status === 'completed' ? 'text-green-700' : 'text-yellow-700'}`}>
                      {vaccination.status === 'completed' ? 'Виконано' : 'Заплановано'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Medications */}
          <View>
            <Text className="font-semibold text-gray-700 mb-2">Ліки</Text>
            {mockPetData.medications.map((medication, index) => (
              <View key={index} className="bg-white border border-gray-200 p-4 rounded-xl">
                <View className="flex-row items-center">
                  <MaterialIcons name="local-pharmacy" size={24} color="#fbbf24" />
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-gray-800">{medication.name}</Text>
                    <Text className="text-gray-600 text-sm">
                      {medication.dosage} • {medication.frequency}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      Наступний прийом: {medication.nextDate}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="h-0.5 bg-gray-200 my-4" />

        {/* Upcoming Appointments */}
        <View>
          <Text className="text-xl font-bold text-gray-800 mb-4">Найближчі візити</Text>

          <View>
            {mockPetData.upcomingAppointments.map((appointment, index) => (
              <View key={index} className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-3">
                <View className="flex-row items-start">
                  <View className="bg-blue-400 p-2 rounded-full mr-3">
                    <MaterialIcons name="calendar-today" size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">{appointment.type}</Text>
                    <Text className="text-gray-600 text-sm">
                      {appointment.date} • {appointment.time}
                    </Text>
                    <Text className="text-gray-500 text-xs">{appointment.vet}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="h-0.5 bg-gray-200 my-4" />

        {/* Veterinary Information */}
        <View>
          <Text className="text-xl font-bold text-gray-800 mb-4">Ветеринар</Text>

          <View className="bg-green-50 border border-green-200 p-4 rounded-xl">
            <View>
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="location-on" size={24} color="#10b981" />
                <Text className="font-semibold text-gray-800 flex-1 ml-3">
                  {mockPetData.vet}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="phone" size={24} color="#10b981" />
                <Text className="text-gray-600 ml-3">{mockPetData.vetPhone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View>
          <Text className="text-xl font-bold text-gray-800 mb-4">Нотатки</Text>

          <View className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
            <Text className="text-gray-700 leading-relaxed">
              {mockPetData.notes}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
