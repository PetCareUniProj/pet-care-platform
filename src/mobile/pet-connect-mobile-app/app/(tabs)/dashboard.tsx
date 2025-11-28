import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePetsStore, useEventsStore } from '@/store';
import { CalendarEvent } from '@/types/reminder.types';
import { Pet } from '@/types/pet.types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

// Quick Actions - Real functions
const quickActions = [
  { id: '1', title: 'Подія', icon: 'event', color: '#3b82f6', bg: 'bg-blue-100', route: '/(tabs)/calendar' },
  { id: '2', title: 'Зважити', icon: 'monitor-weight', color: '#10b981', bg: 'bg-green-100', action: 'weight' },
  { id: '3', title: 'Магазин', icon: 'shopping-cart', color: '#f97316', bg: 'bg-orange-100', route: '/shop' },
  { id: '4', title: 'Підписки', icon: 'autorenew', color: '#8b5cf6', bg: 'bg-violet-100', route: '/subscriptions' },
];

const secondaryActions = [
  { id: '5', title: 'Здоров\'я', icon: 'favorite', color: '#ef4444', bg: 'bg-red-100', route: '/health' },
  { id: '6', title: 'Статистика', icon: 'analytics', color: '#06b6d4', bg: 'bg-cyan-100', route: '/stats' },
  { id: '7', title: 'Документи', icon: 'description', color: '#6b7280', bg: 'bg-gray-100', route: '/documents' },
  { id: '8', title: 'Налаштування', icon: 'settings', color: '#f59e0b', bg: 'bg-amber-100', route: '/settings' },
];

// Tips bank - dynamic tips for pets
interface Tip {
  id: string;
  text: string;
  icon: string;
  petType?: 'cat' | 'dog' | 'all';
  dynamic?: boolean; // If true, will include pet name
}

const TIPS_BANK: Tip[] = [
  // General tips
  { id: '1', text: 'Регулярні прогулянки допомагають підтримувати здорову вагу та настрій вашого улюбленця!', icon: '🚶', petType: 'all' },
  { id: '2', text: 'Свіжа вода повинна бути завжди доступна для вашого улюбленця. Міняйте воду щодня!', icon: '💧', petType: 'all' },
  { id: '3', text: 'Регулярний огляд у ветеринара допоможе виявити проблеми зі здоров\'ям на ранній стадії.', icon: '🏥', petType: 'all' },
  { id: '4', text: 'Чистіть зуби вашого улюбленця хоча б раз на тиждень для профілактики захворювань ясен.', icon: '🦷', petType: 'all' },
  { id: '5', text: 'Грайтеся з вашим улюбленцем щодня — це зміцнює ваш зв\'язок!', icon: '🎾', petType: 'all' },
  
  // Dog-specific tips
  { id: '6', text: 'Собаки люблять рутину. Годуйте та вигулюйте в один і той же час щодня.', icon: '🐕', petType: 'dog' },
  { id: '7', text: 'Не забувайте про щеплення від сказу — це обов\'язково для всіх собак!', icon: '💉', petType: 'dog' },
  { id: '8', text: 'Тренування слухняності зробить прогулянки приємнішими для вас обох.', icon: '🎓', petType: 'dog' },
  
  // Cat-specific tips
  { id: '9', text: 'Коти потребують вертикального простору — встановіть полиці або купіть дряпку!', icon: '🐱', petType: 'cat' },
  { id: '10', text: 'Чистіть лоток щодня — коти дуже чистоплотні і можуть відмовлятися від брудного.', icon: '🧹', petType: 'cat' },
  { id: '11', text: 'Коти люблять ховатися — забезпечте затишне місце для сну та відпочинку.', icon: '🏠', petType: 'cat' },
  
  // Dynamic tips (with pet names)
  { id: '12', text: 'Час зважити {petName}! Регулярний контроль ваги допоможе виявити проблеми зі здоров\'ям.', icon: '⚖️', petType: 'all', dynamic: true },
  { id: '13', text: '{petName} буде радий(-а) новій іграшці! Змінюйте іграшки час від часу.', icon: '🧸', petType: 'all', dynamic: true },
  { id: '14', text: 'Вичесуйте {petName} регулярно — це запобігає утворенню ковтунів та знімає стрес.', icon: '✨', petType: 'all', dynamic: true },
  { id: '15', text: 'Чи отримує {petName} достатньо вітамінів? Поговоріть з ветеринаром про добавки.', icon: '💊', petType: 'all', dynamic: true },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { pets, fetchPets, isLoading, addPetWeight } = usePetsStore();
  const { events, fetchEvents, getUpcomingEvents, isLoading: eventsLoading } = useEventsStore();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useThemedStyles();

  // Weight modal
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [selectedPetForWeight, setSelectedPetForWeight] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState('');

  // Get 3 upcoming events from store
  const upcomingEvents = useMemo(() => getUpcomingEvents(3), [events]);

  // Generate random tip based on pets
  const dailyTip = useMemo(() => {
    // Get tips relevant to user's pets
    const petTypes = new Set(pets.map(p => p.type));
    const relevantTips = TIPS_BANK.filter(tip => 
      tip.petType === 'all' || petTypes.has(tip.petType as 'cat' | 'dog')
    );
    
    // Use date as seed for consistent daily tip
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const tipIndex = seed % relevantTips.length;
    let tip = relevantTips[tipIndex];
    
    // Replace {petName} with actual pet name if dynamic
    if (tip.dynamic && pets.length > 0) {
      const petIndex = seed % pets.length;
      const petName = pets[petIndex].name;
      tip = { ...tip, text: tip.text.replace('{petName}', petName) };
    }
    
    return tip;
  }, [pets]);

  useEffect(() => {
    fetchPets();
    fetchEvents();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPets(), useEventsStore.getState().refreshEvents()]);
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

  // Health overview for pets
  const getHealthStatus = (pet: Pet) => {
    let status = 'good';
    let issues: string[] = [];
    
    // Check profile completeness
    if ((pet.profileCompleteness || 0) < 70) {
      status = 'warning';
      issues.push('Профіль неповний');
    }
    
    // Check weight
    if (!pet.weight) {
      status = 'warning';
      issues.push('Вага не вказана');
    }
    
    return { status, issues };
  };

  const selectedPet = pets.find(p => p.id === selectedPetForWeight);

  return (
    <ScrollView 
      className={`flex-1 ${theme.bgPrimary}`}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={theme.gradientColors.orange}
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
        
        {/* Daily Tip */}
        <View>
          <LinearGradient
            colors={theme.isDark ? ['#78350f', '#92400e'] : ['#fef3c7', '#fde68a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className={`flex-row items-start gap-4 rounded-2xl p-5 border ${theme.isDark ? 'border-amber-700' : 'border-amber-200'}`}>
              <View className={`${theme.isDark ? 'bg-amber-600' : 'bg-amber-400'} p-3 rounded-xl`}>
                <Text className="text-2xl">{dailyTip.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className={`${theme.isDark ? 'text-amber-200' : 'text-amber-900'} font-bold text-base`}>Порада дня 💡</Text>
                <Text className={`${theme.isDark ? 'text-amber-300' : 'text-amber-800'} text-sm mt-1`}>
                  {dailyTip.text}
                </Text>
              </View>
              </View>
          </LinearGradient>
              </View>

        {/* Secondary Actions */}
        <View className="gap-3">
          <Text className={`text-lg font-bold ${theme.textPrimary} ml-1`}>Швидкі дії</Text>
          <View className="flex-row flex-wrap gap-3">
            {secondaryActions.map((action) => (
              <TouchableOpacity 
                key={action.id} 
                onPress={() => action.route && router.push(action.route as any)}
                className={`flex-row items-center ${theme.bgCard} p-4 rounded-2xl border ${theme.borderColor} w-[48%] shadow-sm`}
              >
                <View className={`w-10 h-10 rounded-xl items-center justify-center ${action.bg} mr-3`}>
                  <MaterialIcons name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text className={`${theme.isDark ? 'text-gray-200' : 'text-gray-700'} font-semibold text-sm flex-1`}>{action.title}</Text>
                <MaterialIcons name="chevron-right" size={20} color={theme.chevronColor} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pet Health Overview */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className={`text-lg font-bold ${theme.textPrimary} ml-1`}>Здоров'я улюбленців</Text>
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
              className={`${theme.bgCard} border-2 border-dashed border-orange-200 rounded-2xl p-8 items-center`}
            >
              <View className="bg-orange-100 w-16 h-16 rounded-full items-center justify-center mb-3">
                <MaterialIcons name="pets" size={32} color="#f97316" />
              </View>
              <Text className={`${theme.isDark ? 'text-gray-200' : 'text-gray-700'} font-bold text-lg`}>Додайте першого улюбленця</Text>
              <Text className={theme.textSecondary + ' text-center mt-1'}>Натисніть, щоб створити профіль</Text>
            </TouchableOpacity>
          ) : (
            <View className="gap-3">
              {pets.map((pet) => {
                const { status, issues } = getHealthStatus(pet);
                return (
                  <TouchableOpacity 
                    key={pet.id}
                    onPress={() => handlePetPress(pet.id)}
                    className={`${theme.bgCard} rounded-2xl p-4 shadow-sm border ${theme.borderColor} flex-row items-center`}
                  >
                    <Image
                      source={pet.photoUrl ? { uri: pet.photoUrl } : require('@/assets/images/pet-cat-mock-profile-image.png')}
                      className={`w-14 h-14 rounded-full ${theme.isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                      style={{ width: 56, height: 56 }}
                    />
                    <View className="flex-1 ml-4">
                      <Text className={`${theme.textPrimary} font-bold text-base`}>{pet.name}</Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className={`${theme.textSecondary} text-sm`}>
                          {pet.type === 'cat' ? '🐱' : '🐕'} {pet.breed || 'Не вказано'}
                        </Text>
                        {pet.weight && (
                          <Text className={`${theme.textMuted} text-sm`}>• {pet.weight} {pet.weightUnit || 'кг'}</Text>
                        )}
                      </View>
                      {issues.length > 0 && (
                        <Text className="text-amber-600 text-xs mt-1">⚠️ {issues[0]}</Text>
                      )}
                    </View>
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${
                      status === 'good' ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      <MaterialIcons 
                        name={status === 'good' ? 'check-circle' : 'warning'} 
                        size={22} 
                        color={status === 'good' ? '#22c55e' : '#f59e0b'} 
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Upcoming Events */}
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
          <Text className={`text-lg font-bold ${theme.textPrimary} ml-1`}>Найближчі події</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
              <Text className="text-orange-500 font-semibold text-sm">Всі події →</Text>
            </TouchableOpacity>
          </View>

          {eventsLoading ? (
            <ActivityIndicator color="#f97316" />
          ) : upcomingEvents.length === 0 ? (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/calendar')}
              className={`${theme.bgCard} border ${theme.borderColor} rounded-2xl p-6 items-center shadow-sm`}
            >
              <View className={`${theme.isDark ? 'bg-gray-700' : 'bg-gray-100'} w-14 h-14 rounded-full items-center justify-center mb-3`}>
                <MaterialIcons name="event-available" size={28} color="#9ca3af" />
              </View>
              <Text className={`${theme.isDark ? 'text-gray-300' : 'text-gray-600'} font-semibold`}>Немає запланованих подій</Text>
              <Text className={theme.textMuted + ' text-sm mt-1'}>Натисніть, щоб додати</Text>
            </TouchableOpacity>
          ) : (
          <View className="gap-3">
              {upcomingEvents.map((event) => {
                const colors = getEventColor(event.type);
                return (
                  <TouchableOpacity 
                    key={event.id}
                    onPress={() => router.push('/(tabs)/calendar')}
                    className={`${theme.isDark ? theme.bgCard : colors.bg} border ${theme.isDark ? theme.borderColor : colors.border} rounded-2xl p-4 flex-row items-center gap-4 shadow-sm`}
                  >
                    <View className={`${colors.badge} p-3 rounded-xl`}>
                      <MaterialIcons name={colors.icon as any} size={24} color={colors.iconColor} />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-bold ${theme.textPrimary}`}>{event.title}</Text>
                      <Text className={`${theme.textSecondary} text-sm`}>{formatEventDate(event.date, event.time)}</Text>
                      <View className="flex-row items-center gap-1 mt-1">
                        <MaterialIcons name="pets" size={12} color="#9ca3af" />
                        <Text className={`${theme.textMuted} text-xs`}>{event.petName}</Text>
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
            </View>

      {/* Weight Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWeightModalVisible}
        onRequestClose={() => setIsWeightModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`${theme.bgCard} p-6 rounded-2xl w-[90%] gap-4`}>
            <View className="items-center mb-2">
              <View className="bg-green-100 w-16 h-16 rounded-full items-center justify-center mb-2">
                <MaterialIcons name="monitor-weight" size={32} color="#22c55e" />
              </View>
              <Text className={`text-xl font-bold ${theme.textPrimary}`}>Зважування</Text>
              <Text className={theme.textSecondary}>Введіть поточну вагу улюбленця</Text>
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
                        selectedPetForWeight === pet.id ? 'bg-green-500' : theme.isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <Text className={selectedPetForWeight === pet.id ? 'text-white font-semibold' : theme.isDark ? 'text-gray-300' : 'text-gray-600'}>
                        {pet.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
              </ScrollView>
            )}

            <View className="flex-row items-center gap-2">
              <TextInput
                className={`flex-1 border ${theme.borderColorMedium} rounded-xl p-4 ${theme.textPrimary} text-2xl text-center font-bold ${theme.bgInput}`}
                keyboardType="numeric"
                placeholder="0.0"
                placeholderTextColor={theme.isDark ? '#6b7280' : '#9ca3af'}
                value={newWeight}
                onChangeText={setNewWeight}
              />
              <Text className={`text-xl font-bold ${theme.textSecondary}`}>{selectedPet?.weightUnit || 'кг'}</Text>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                className={`flex-1 ${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'} p-3 rounded-xl items-center`}
                onPress={() => {
                  setNewWeight('');
                  setIsWeightModalVisible(false);
                }}
              >
                <Text className={`font-bold ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>Скасувати</Text>
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
