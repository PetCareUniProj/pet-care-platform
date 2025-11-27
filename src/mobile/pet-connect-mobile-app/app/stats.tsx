import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { usePetsStore } from '@/store';
import { remindersService } from '@/services/api/reminders.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StatsScreen() {
  const router = useRouter();
  const { pets, fetchPets, isLoading } = usePetsStore();
  const [eventsCount, setEventsCount] = useState(0);
  const [completedEvents, setCompletedEvents] = useState(0);

  useEffect(() => {
    fetchPets();
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const events = await remindersService.getCalendarEvents();
      setEventsCount(events.length);
      // Mock completed events
      setCompletedEvents(Math.floor(events.length * 0.7));
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  // Calculate statistics
  const totalPets = pets.length;
  const averageProfileCompleteness = totalPets > 0
    ? Math.round(pets.reduce((sum, pet) => sum + (pet.profileCompleteness || 0), 0) / totalPets)
    : 0;
  const totalWeight = pets.reduce((sum, pet) => sum + (pet.weight || 0), 0);
  const petsWithVaccinations = pets.filter(p => p.vaccinationStatus && p.vaccinationStatus.length > 0).length;

  // Weight history chart data (mock for visualization)
  const getWeightTrend = () => {
    if (pets.length === 0) return [];
    const firstPet = pets[0];
    const history = firstPet.weightHistory || [];
    return history.slice(-6); // Last 6 entries
  };

  const weightTrend = getWeightTrend();
  const maxWeight = Math.max(...weightTrend.map(w => w.weight), 1);

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
          colors={['#06b6d4', '#0891b2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-14 pb-8 px-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Статистика</Text>
            <View className="w-10" />
          </View>

          <Text className="text-white/80 text-center">
            Аналітика догляду за улюбленцями
          </Text>
        </LinearGradient>

        <View className="px-6 py-6 gap-6 -mt-4">
          {/* Main Stats Grid */}
          <View className="flex-row flex-wrap gap-4">
            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ width: '47%' }}>
              <View className="bg-cyan-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <MaterialIcons name="pets" size={24} color="#06b6d4" />
              </View>
              <Text className="text-gray-500 text-sm">Улюбленців</Text>
              <Text className="text-gray-800 text-3xl font-bold">{totalPets}</Text>
            </View>

            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ width: '47%' }}>
              <View className="bg-green-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <MaterialIcons name="check-circle" size={24} color="#22c55e" />
              </View>
              <Text className="text-gray-500 text-sm">Заповненість</Text>
              <Text className="text-gray-800 text-3xl font-bold">{averageProfileCompleteness}%</Text>
            </View>

            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ width: '47%' }}>
              <View className="bg-amber-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <MaterialIcons name="event" size={24} color="#f59e0b" />
              </View>
              <Text className="text-gray-500 text-sm">Подій</Text>
              <Text className="text-gray-800 text-3xl font-bold">{eventsCount}</Text>
            </View>

            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm" style={{ width: '47%' }}>
              <View className="bg-violet-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <MaterialIcons name="vaccines" size={24} color="#8b5cf6" />
              </View>
              <Text className="text-gray-500 text-sm">Вакциновано</Text>
              <Text className="text-gray-800 text-3xl font-bold">{petsWithVaccinations}</Text>
            </View>
          </View>

          {/* Weight Chart */}
          {weightTrend.length > 0 && (
            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-800">Динаміка ваги</Text>
                <Text className="text-gray-500 text-sm">{pets[0]?.name}</Text>
              </View>

              {/* Simple Bar Chart */}
              <View className="flex-row items-end justify-between h-32 mt-4">
                {weightTrend.map((entry, index) => (
                  <View key={index} className="items-center flex-1">
                    <Text className="text-xs text-gray-500 mb-1">{entry.weight}</Text>
                    <View
                      className="bg-cyan-400 rounded-t-lg w-8"
                      style={{
                        height: (entry.weight / maxWeight) * 80,
                      }}
                    />
                    <Text className="text-xs text-gray-400 mt-2">
                      {new Date(entry.date).toLocaleDateString('uk', { month: 'short' })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Activity Summary */}
          <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">Активність</Text>

            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="bg-green-100 p-2 rounded-lg">
                    <MaterialIcons name="check" size={20} color="#22c55e" />
                  </View>
                  <Text className="text-gray-600">Виконані події</Text>
                </View>
                <Text className="text-gray-800 font-bold">{completedEvents}</Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="bg-amber-100 p-2 rounded-lg">
                    <MaterialIcons name="schedule" size={20} color="#f59e0b" />
                  </View>
                  <Text className="text-gray-600">Заплановані</Text>
                </View>
                <Text className="text-gray-800 font-bold">{eventsCount - completedEvents}</Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="bg-cyan-100 p-2 rounded-lg">
                    <MaterialIcons name="fitness-center" size={20} color="#06b6d4" />
                  </View>
                  <Text className="text-gray-600">Загальна вага</Text>
                </View>
                <Text className="text-gray-800 font-bold">{totalWeight.toFixed(1)} кг</Text>
              </View>
            </View>
          </View>

          {/* Pet Health Overview */}
          <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">Стан профілів</Text>

            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                onPress={() => router.push({ pathname: '/pets/[id]', params: { id: pet.id } })}
                className="flex-row items-center gap-3 py-3 border-b border-gray-100 last:border-b-0"
              >
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                  <Text className="text-lg">{pet.type === 'cat' ? '🐱' : pet.type === 'dog' ? '🐕' : '🐾'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-semibold">{pet.name}</Text>
                  <View className="bg-gray-200 h-2 rounded-full mt-1 overflow-hidden">
                    <View
                      className={`h-full rounded-full ${
                        (pet.profileCompleteness || 0) >= 80
                          ? 'bg-green-500'
                          : (pet.profileCompleteness || 0) >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${pet.profileCompleteness || 0}%` }}
                    />
                  </View>
                </View>
                <Text className="text-gray-500 font-semibold">{pet.profileCompleteness || 0}%</Text>
              </TouchableOpacity>
            ))}

            {pets.length === 0 && (
              <Text className="text-gray-400 text-center py-4">Немає улюбленців</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

