import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'expo-image';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { usePetsStore } from '@/store';
import { remindersService } from '@/services/api/reminders.service';
import { CalendarEvent } from '@/types/reminder.types';

interface HealthMetric {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  bg: string;
}

export default function HealthScreen() {
  const router = useRouter();
  const { pets, fetchPets, isLoading } = usePetsStore();
  const [upcomingHealthEvents, setUpcomingHealthEvents] = useState<CalendarEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      await fetchPets();
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      const events = await remindersService.getCalendarEvents(today, endDate.toISOString().split('T')[0]);
      
      // Filter health-related events
      const healthTypes = ['vaccination', 'vet_visit', 'medication', 'parasite_treatment'];
      const healthEvents = events
        .filter(e => healthTypes.includes(e.type))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      
      setUpcomingHealthEvents(healthEvents);
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthNames = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вер', 'жовт', 'лист', 'груд'];
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
  };

  const getEventTypeInfo = (type: string) => {
    switch (type) {
      case 'vaccination':
        return { label: 'Вакцинація', icon: 'vaccines', color: '#22c55e', bg: 'bg-green-100' };
      case 'vet_visit':
        return { label: 'Візит до ветеринара', icon: 'local-hospital', color: '#3b82f6', bg: 'bg-blue-100' };
      case 'medication':
        return { label: 'Ліки', icon: 'medication', color: '#ef4444', bg: 'bg-red-100' };
      case 'parasite_treatment':
        return { label: 'Обробка від паразитів', icon: 'bug-report', color: '#f59e0b', bg: 'bg-amber-100' };
      default:
        return { label: 'Подія', icon: 'event', color: '#6b7280', bg: 'bg-gray-100' };
    }
  };

  const getHealthMetrics = (): HealthMetric[] => {
    const totalPets = pets.length;
    const petsWithWeight = pets.filter(p => p.weight).length;
    const avgCompleteness = pets.length > 0 
      ? Math.round(pets.reduce((sum, p) => sum + (p.profileCompleteness || 0), 0) / pets.length)
      : 0;
    
    return [
      { label: 'Улюбленців', value: String(totalPets), icon: 'pets', color: '#f97316', bg: 'bg-orange-100' },
      { label: 'З вагою', value: String(petsWithWeight), icon: 'monitor-weight', color: '#22c55e', bg: 'bg-green-100' },
      { label: 'Профілі', value: `${avgCompleteness}%`, icon: 'assignment', color: '#3b82f6', bg: 'bg-blue-100' },
      { label: 'Подій', value: String(upcomingHealthEvents.length), icon: 'event', color: '#8b5cf6', bg: 'bg-violet-100' },
    ];
  };

  if (isLoading && pets.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#ef4444', '#dc2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="flex-row items-center justify-between pt-14 pb-6 px-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Здоров'я улюбленців</Text>
            <View className="w-10" />
          </View>

          {/* Health Metrics */}
          <View className="flex-row flex-wrap gap-3 px-6 pb-6">
            {getHealthMetrics().map((metric, index) => (
              <View 
                key={index}
                className="bg-white/20 rounded-2xl p-4 border border-white/30"
                style={{ width: '47%' }}
              >
                <View className={`${metric.bg} w-10 h-10 rounded-xl items-center justify-center mb-2`}>
                  <MaterialIcons name={metric.icon} size={22} color={metric.color} />
                </View>
                <Text className="text-white text-2xl font-bold">{metric.value}</Text>
                <Text className="text-white/70 text-sm">{metric.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View className="px-6 py-6 gap-6 -mt-4">
          {/* Pet Health Cards */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-gray-800 ml-1">Ваші улюбленці</Text>
            
            {pets.length === 0 ? (
              <TouchableOpacity 
                onPress={() => router.push('/pets/create')}
                className="bg-white border-2 border-dashed border-red-200 rounded-2xl p-8 items-center"
              >
                <View className="bg-red-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                  <MaterialIcons name="pets" size={32} color="#ef4444" />
                </View>
                <Text className="text-gray-700 font-bold text-lg">Додайте улюбленця</Text>
                <Text className="text-gray-500 text-center mt-1">Для відстеження здоров'я</Text>
              </TouchableOpacity>
            ) : (
              pets.map((pet) => {
                const completeness = pet.profileCompleteness || 0;
                const healthStatus = completeness >= 80 ? 'excellent' : completeness >= 50 ? 'good' : 'needs_attention';
                
                return (
                  <TouchableOpacity
                    key={pet.id}
                    onPress={() => router.push({ pathname: '/pets/[id]', params: { id: pet.id } })}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                  >
                    <View className="flex-row items-center gap-4">
                      <Image
                        source={pet.photoUrl ? { uri: pet.photoUrl } : require('@/assets/images/pet-cat-mock-profile-image.png')}
                        className="w-16 h-16 rounded-full bg-gray-100"
                        style={{ width: 64, height: 64 }}
                      />
                      <View className="flex-1">
                        <Text className="text-gray-800 font-bold text-lg">{pet.name}</Text>
                        <Text className="text-gray-500 text-sm">
                          {pet.type === 'cat' ? '🐱 Кіт' : '🐕 Собака'} • {pet.breed || 'Порода не вказана'}
                        </Text>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${
                        healthStatus === 'excellent' ? 'bg-green-100' :
                        healthStatus === 'good' ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <Text className={`text-xs font-bold ${
                          healthStatus === 'excellent' ? 'text-green-700' :
                          healthStatus === 'good' ? 'text-amber-700' : 'text-red-700'
                        }`}>
                          {healthStatus === 'excellent' ? '✓ Відмінно' :
                           healthStatus === 'good' ? '◐ Добре' : '! Увага'}
                        </Text>
                      </View>
                    </View>

                    {/* Health Details */}
                    <View className="flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
                      <View className="flex-1 items-center">
                        <Text className="text-gray-400 text-xs mb-1">Вага</Text>
                        <Text className="text-gray-800 font-bold">
                          {pet.weight ? `${pet.weight} ${pet.weightUnit || 'кг'}` : '—'}
                        </Text>
                      </View>
                      <View className="flex-1 items-center">
                        <Text className="text-gray-400 text-xs mb-1">Вік</Text>
                        <Text className="text-gray-800 font-bold">
                          {pet.birthDate ? `${new Date().getFullYear() - new Date(pet.birthDate).getFullYear()} р.` : '—'}
                        </Text>
                      </View>
                      <View className="flex-1 items-center">
                        <Text className="text-gray-400 text-xs mb-1">Профіль</Text>
                        <Text className={`font-bold ${
                          completeness >= 80 ? 'text-green-600' :
                          completeness >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {completeness}%
                        </Text>
                      </View>
                    </View>

                    {/* Weight History Chart (simplified) */}
                    {pet.weightHistory && pet.weightHistory.length > 1 && (
                      <View className="mt-4 pt-4 border-t border-gray-100">
                        <Text className="text-gray-600 text-sm font-semibold mb-2">Остання зміна ваги</Text>
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons 
                            name={pet.weightHistory[pet.weightHistory.length - 1].weight > pet.weightHistory[pet.weightHistory.length - 2].weight ? 'trending-up' : 'trending-down'} 
                            size={20} 
                            color={pet.weightHistory[pet.weightHistory.length - 1].weight > pet.weightHistory[pet.weightHistory.length - 2].weight ? '#ef4444' : '#22c55e'} 
                          />
                          <Text className="text-gray-700">
                            {Math.abs(pet.weightHistory[pet.weightHistory.length - 1].weight - pet.weightHistory[pet.weightHistory.length - 2].weight).toFixed(1)} {pet.weightUnit || 'кг'}
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {/* Upcoming Health Events */}
          {upcomingHealthEvents.length > 0 && (
            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-800 ml-1">Медичні події</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
                  <Text className="text-red-500 font-semibold text-sm">Всі →</Text>
                </TouchableOpacity>
              </View>

              {upcomingHealthEvents.map((event) => {
                const typeInfo = getEventTypeInfo(event.type);
                return (
                  <View
                    key={event.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center gap-4"
                  >
                    <View className={`${typeInfo.bg} p-3 rounded-xl`}>
                      <MaterialIcons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-semibold">{event.title}</Text>
                      <Text className="text-gray-500 text-sm">{event.petName} • {formatDate(event.date)}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={22} color="#d1d5db" />
                  </View>
                );
              })}
            </View>
          )}

          {/* Health Tips */}
          <View className="bg-red-50 rounded-2xl p-5 border border-red-100">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="bg-red-100 p-2 rounded-xl">
                <MaterialIcons name="tips-and-updates" size={22} color="#ef4444" />
              </View>
              <Text className="text-red-800 font-bold text-base">Поради для здоров'я</Text>
            </View>
            <View className="gap-2">
              <Text className="text-red-700 text-sm">• Регулярно перевіряйте вагу улюбленця</Text>
              <Text className="text-red-700 text-sm">• Не пропускайте вакцинацію</Text>
              <Text className="text-red-700 text-sm">• Проводьте обробку від паразитів</Text>
              <Text className="text-red-700 text-sm">• Відвідуйте ветеринара раз на рік</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

