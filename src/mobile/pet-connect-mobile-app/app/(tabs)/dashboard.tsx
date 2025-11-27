import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePetsStore } from '@/store';
import { remindersService } from '@/services/api/reminders.service';
import { CalendarEvent } from '@/types/reminder.types';

// Quick Actions - Real functions
const quickActions = [
  { id: '1', title: 'Подія', icon: 'event', color: '#3b82f6', bg: 'bg-blue-100', route: '/(tabs)/calendar' },
  { id: '2', title: 'Зважити', icon: 'monitor-weight', color: '#10b981', bg: 'bg-green-100', action: 'weight' },
  { id: '3', title: 'Магазин', icon: 'shopping-cart', color: '#f97316', bg: 'bg-orange-100', route: '/shop' },
  { id: '4', title: 'Підписки', icon: 'autorenew', color: '#8b5cf6', bg: 'bg-violet-100', route: '/subscriptions' },
];

const secondaryActions = [
  { id: '5', title: 'Мої улюбленці', icon: 'pets', color: '#ef4444', bg: 'bg-red-100', route: '/pets-list' },
  { id: '6', title: 'Статистика', icon: 'analytics', color: '#06b6d4', bg: 'bg-cyan-100', route: '/stats' },
  { id: '7', title: 'Документи', icon: 'description', color: '#6b7280', bg: 'bg-gray-100', route: '/documents' },
  { id: '8', title: 'Налаштування', icon: 'settings', color: '#f59e0b', bg: 'bg-amber-100', route: '/settings' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { pets, fetchPets, isLoading, addPetWeight } = usePetsStore();
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Weight modal
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [selectedPetForWeight, setSelectedPetForWeight] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState('');

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);
      const events = await remindersService.getCalendarEvents(today, endDate.toISOString().split('T')[0]);
      
      // Filter only upcoming events and sort by date
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const upcoming = events
        .filter(e => {
          const eventDate = new Date(e.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= now;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3); // Only 3 nearest events
      
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
    loadEvents();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPets(), loadEvents()]);
    setRefreshing(false);
  }, []);

  const handlePetPress = (id: string) => {
    router.push({ pathname: '/pets/[id]', params: { id } });
  };

  const handleAddPet = () => {
    router.push('/pets/create');
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (action.route) {
      router.push(action.route as any);
    } else if (action.action === 'weight') {
      if (pets.length > 0) {
        setSelectedPetForWeight(pets[0].id);
        setIsWeightModalVisible(true);
      } else {
        Alert.alert('Увага', 'Спочатку додайте улюбленця');
      }
    }
  };

  const handleAddWeight = async () => {
    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Помилка', 'Введіть коректну вагу');
      return;
    }
    if (selectedPetForWeight) {
      await addPetWeight(selectedPetForWeight, weightValue);
      setNewWeight('');
      setIsWeightModalVisible(false);
      Alert.alert('Успішно', 'Вагу збережено');
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return { bg: 'bg-green-50', border: 'border-green-100', icon: 'vaccines', iconColor: '#22c55e', badge: 'bg-green-100', badgeText: 'text-green-700' };
      case 'vet_visit':
        return { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'local-hospital', iconColor: '#3b82f6', badge: 'bg-blue-100', badgeText: 'text-blue-700' };
      case 'medication':
        return { bg: 'bg-red-50', border: 'border-red-100', icon: 'medication', iconColor: '#ef4444', badge: 'bg-red-100', badgeText: 'text-red-700' };
      case 'grooming':
        return { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'content-cut', iconColor: '#8b5cf6', badge: 'bg-purple-100', badgeText: 'text-purple-700' };
      case 'parasite_treatment':
        return { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bug-report', iconColor: '#f59e0b', badge: 'bg-amber-100', badgeText: 'text-amber-700' };
      default:
        return { bg: 'bg-orange-50', border: 'border-orange-100', icon: 'event', iconColor: '#f97316', badge: 'bg-orange-100', badgeText: 'text-orange-700' };
    }
  };

  const formatEventDate = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthNames = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вер', 'жовт', 'лист', 'груд'];

    let dateText = `${date.getDate()} ${monthNames[date.getMonth()]}`;
    
    if (date.toDateString() === now.toDateString()) {
      dateText = 'Сьогодні';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateText = 'Завтра';
    }

    return `${dateText}${timeStr ? ` • ${timeStr}` : ''}`;
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Сьогодні';
    if (diff === 1) return 'Завтра';
    if (diff <= 7) return `Через ${diff} дн.`;
    return `Через ${diff} дн.`;
  };

  const selectedPet = pets.find(p => p.id === selectedPetForWeight);

  return (
    <ScrollView 
      className="flex-1 bg-gray-50" 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#fb923c', '#f59e0b']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
      >
        <View className="px-6 pt-14 pb-6 rounded-b-[40px]">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-white/80 text-sm">Вітаємо в</Text>
              <Text className="text-white text-3xl font-bold">Pet Connect 🐾</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/settings' as any)}
              className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border-2 border-white/30"
            >
              <MaterialIcons name="person" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          {pets.length > 0 && (
            <View className="flex-row gap-3 mt-6">
              <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
                <View className="flex-row items-center gap-2">
                  <View className="bg-white/30 p-2 rounded-full">
                    <MaterialIcons name="pets" size={20} color="white" />
                  </View>
                  <Text className="text-white/80 text-sm">Улюбленців</Text>
                </View>
                <Text className="text-white text-3xl font-bold mt-2">{pets.length}</Text>
              </View>
              <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
                <View className="flex-row items-center gap-2">
                  <View className="bg-white/30 p-2 rounded-full">
                    <MaterialIcons name="event" size={20} color="white" />
                  </View>
                  <Text className="text-white/80 text-sm">Подій</Text>
          </View>
                <Text className="text-white text-3xl font-bold mt-2">{upcomingEvents.length}</Text>
          </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-4 pb-6">
          <View className="flex-row justify-around">
            {quickActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                onPress={() => handleQuickAction(action)}
                className="items-center w-[22%]"
              >
                <View className={`w-14 h-14 rounded-2xl items-center justify-center ${action.bg} shadow-sm mb-2`}>
                  <MaterialIcons name={action.icon as any} size={26} color={action.color} />
              </View>
              <Text className="text-white text-xs font-medium text-center">{action.title}</Text>
            </TouchableOpacity>
          ))}
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View className="px-6 pt-6 gap-6 pb-8 -mt-2">
        
        {/* Secondary Actions */}
        <View className="gap-3">
          <Text className="text-lg font-bold text-gray-800 ml-1">Швидкі дії</Text>
          <View className="flex-row flex-wrap gap-3">
            {secondaryActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                onPress={() => action.route && router.push(action.route as any)}
                className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 w-[48%] active:bg-gray-50 shadow-sm"
              >
                <View className={`w-10 h-10 rounded-xl items-center justify-center ${action.bg} mr-3`}>
                  <MaterialIcons name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text className="text-gray-700 font-semibold text-sm flex-1">{action.title}</Text>
                <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Pets */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-800 ml-1">Мої улюбленці</Text>
            <TouchableOpacity onPress={handleAddPet}>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="add" size={18} color="#f97316" />
                <Text className="text-orange-500 font-semibold text-sm">Додати</Text>
              </View>
            </TouchableOpacity>
          </View>

          {isLoading && pets.length === 0 ? (
             <ActivityIndicator color="#f97316" />
          ) : pets.length === 0 ? (
            <TouchableOpacity 
              onPress={handleAddPet}
              className="bg-white border-2 border-dashed border-orange-200 rounded-2xl p-8 items-center"
            >
              <View className="bg-orange-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                <MaterialIcons name="pets" size={32} color="#f97316" />
              </View>
              <Text className="text-gray-700 font-bold text-lg">Додайте першого улюбленця</Text>
              <Text className="text-gray-500 text-center mt-1">Натисніть, щоб створити профіль</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
              <View className="flex-row gap-4 px-2">
            {pets.map((pet) => (
              <TouchableOpacity 
                key={pet.id} 
                onPress={() => handlePetPress(pet.id)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-44"
              >
                    <View className="items-center">
                      <View className="relative mb-3">
                <Image
                  source={pet.photoUrl ? { uri: pet.photoUrl } : require('@/assets/images/pet-cat-mock-profile-image.png')}
                          className="w-20 h-20 rounded-full bg-gray-100"
                          style={{ width: 80, height: 80 }}
                />
                        <View className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center ${
                          (pet.profileCompleteness || 0) > 80 ? 'bg-green-500' : 'bg-orange-500'
                        }`}>
                          <MaterialIcons 
                            name={(pet.profileCompleteness || 0) > 80 ? 'check' : 'priority-high'} 
                            size={14} 
                            color="white" 
                          />
                    </View>
                  </View>
                      <Text className="text-gray-800 font-bold text-base">{pet.name}</Text>
                      <Text className="text-gray-500 text-xs">
                        {pet.type === 'cat' ? '🐱 Кіт' : pet.type === 'dog' ? '🐕 Собака' : pet.type}
                  </Text>
                      {pet.weight && (
                        <Text className="text-gray-400 text-xs mt-1">
                          {pet.weight} {pet.weightUnit || 'кг'}
                        </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
                <TouchableOpacity
                  onPress={handleAddPet}
                  className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 w-44 items-center justify-center"
                >
                  <View className="bg-gray-200 w-12 h-12 rounded-full items-center justify-center mb-2">
                    <MaterialIcons name="add" size={24} color="#9ca3af" />
                  </View>
                  <Text className="text-gray-400 font-semibold text-sm">Додати</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
          )}
        </View>

        {/* Upcoming Events */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold text-gray-800 ml-1">Найближчі події</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
              <Text className="text-orange-500 font-semibold text-sm">Всі події →</Text>
            </TouchableOpacity>
          </View>

          {eventsLoading ? (
            <ActivityIndicator color="#f97316" />
          ) : upcomingEvents.length === 0 ? (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/calendar')}
              className="bg-white border border-gray-100 rounded-2xl p-6 items-center shadow-sm"
            >
              <View className="bg-gray-100 w-14 h-14 rounded-full items-center justify-center mb-3">
                <MaterialIcons name="event-available" size={28} color="#9ca3af" />
              </View>
              <Text className="text-gray-600 font-semibold">Немає запланованих подій</Text>
              <Text className="text-gray-400 text-sm mt-1">Натисніть, щоб додати</Text>
            </TouchableOpacity>
          ) : (
          <View className="gap-3">
              {upcomingEvents.map((event) => {
                const colors = getEventColor(event.type);
                return (
                  <TouchableOpacity 
                    key={event.id}
                    onPress={() => router.push('/(tabs)/calendar')}
                    className={`${colors.bg} border ${colors.border} rounded-2xl p-4 flex-row items-center gap-4 shadow-sm`}
                  >
                    <View className={`${colors.badge} p-3 rounded-xl`}>
                      <MaterialIcons name={colors.icon as any} size={24} color={colors.iconColor} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800">{event.title}</Text>
                      <Text className="text-gray-600 text-sm">{formatEventDate(event.date, event.time)}</Text>
                      <View className="flex-row items-center gap-1 mt-1">
                        <MaterialIcons name="pets" size={12} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs">{event.petName}</Text>
                      </View>
                    </View>
                    <View className={`${colors.badge} px-3 py-1 rounded-lg`}>
                      <Text className={`${colors.badgeText} text-xs font-bold`}>
                        {getDaysUntil(event.date)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Health Tips Card */}
        <View className="mt-2">
          <LinearGradient
            colors={['#fef3c7', '#fde68a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="flex-row items-start gap-4 rounded-2xl p-5 border border-amber-200">
              <View className="bg-amber-400 p-3 rounded-xl">
                <MaterialIcons name="lightbulb" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-amber-900 font-bold text-base">Порада дня 💡</Text>
                <Text className="text-amber-800 text-sm mt-1">
                  Регулярні прогулянки допомагають підтримувати здорову вагу та настрій вашого улюбленця!
                </Text>
              </View>
              </View>
          </LinearGradient>
              </View>
            </View>

      {/* Weight Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWeightModalVisible}
        onRequestClose={() => setIsWeightModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-[90%] gap-4">
            <View className="items-center mb-2">
              <View className="bg-green-100 w-16 h-16 rounded-full items-center justify-center mb-2">
                <MaterialIcons name="monitor-weight" size={32} color="#22c55e" />
              </View>
              <Text className="text-xl font-bold text-gray-800">Зважування</Text>
              <Text className="text-gray-500">Введіть поточну вагу улюбленця</Text>
              </View>

            {/* Pet selector */}
            {pets.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                <View className="flex-row gap-2">
                  {pets.map((pet) => (
                    <TouchableOpacity
                      key={`weight-selector-${pet.id}`}
                      onPress={() => setSelectedPetForWeight(pet.id)}
                      className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                        selectedPetForWeight === pet.id ? 'bg-green-500' : 'bg-gray-100'
                      }`}
                    >
                      <Text className={selectedPetForWeight === pet.id ? 'text-white font-semibold' : 'text-gray-600'}>
                        {pet.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
              </ScrollView>
            )}

            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 border border-gray-200 rounded-xl p-4 text-gray-800 text-2xl text-center font-bold"
                keyboardType="numeric"
                placeholder="0.0"
                value={newWeight}
                onChangeText={setNewWeight}
              />
              <Text className="text-xl font-bold text-gray-500">{selectedPet?.weightUnit || 'кг'}</Text>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 bg-gray-200 p-3 rounded-xl items-center"
                onPress={() => {
                  setNewWeight('');
                  setIsWeightModalVisible(false);
                }}
              >
                <Text className="font-bold text-gray-700">Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-green-500 p-3 rounded-xl items-center"
                onPress={handleAddWeight}
              >
                <Text className="font-bold text-white">Зберегти</Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
      </Modal>
    </ScrollView>
  );
}
