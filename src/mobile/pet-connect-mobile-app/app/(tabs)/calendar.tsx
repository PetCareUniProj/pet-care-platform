// Calendar screen with events

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CalendarEvent, CreateReminderDto } from '@/types/reminder.types';
import { EventCard, CreateEventModal } from '@/components/calendar';
import { formatDate } from '@/utils/format';
import { remindersService, petsService } from '@/services/api';
import { Pet } from '@/types/pet.types';
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/ui';
import { exportEventToCalendar, exportEventsToCalendar } from '@/utils/calendar';
import { requestNotificationPermissions } from '@/utils/notifications';
import { useEventsStore } from '@/store';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { platformAlert } from '@/utils/alert';

export default function CalendarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ petId?: string }>();
  const theme = useThemedStyles();
  
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Use events from shared store
  const { events, fetchEvents, refreshEvents, isLoading } = useEventsStore();
  
  // Create event modal
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  // Apply pet filter from navigation params
  useEffect(() => {
    if (params.petId) {
      setSelectedPetIds([params.petId]);
    }
  }, [params.petId]);

  // Request notification permissions on mount
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  // Filter events by selected pets
  const filteredEvents = useMemo(() => {
    if (selectedPetIds.length === 0) {
      return events;
    }
    return events.filter((event) => selectedPetIds.includes(event.petId));
  }, [events, selectedPetIds]);

  // Get events for selected date
  const dayEvents = useMemo(() => {
    return filteredEvents.filter((event) => event.date === selectedDate);
  }, [filteredEvents, selectedDate]);

  // Create marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: Record<string, any> = {};
    
    // Group events by date to count them
    const eventsByDate: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((event) => {
      if (!eventsByDate[event.date]) {
        eventsByDate[event.date] = [];
      }
      eventsByDate[event.date].push(event);
    });

    // Create marked dates with dots
    Object.keys(eventsByDate).forEach((date) => {
      marked[date] = {
        marked: true,
        dotColor: '#f97316',
        selected: date === selectedDate,
        selectedColor: '#f97316',
        selectedTextColor: '#ffffff',
      };
    });

    // Mark selected date even if no events
    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#f97316',
        selectedTextColor: '#ffffff',
      };
    }

    return marked;
  }, [filteredEvents, selectedDate]);

  // Load events from shared store
  const loadEvents = useCallback(async () => {
    setError(null);
    try {
      await fetchEvents();
    } catch (err: any) {
      setError(err.message || 'Не вдалося завантажити події');
    }
  }, [fetchEvents]);

  // Load pets from API
  const loadPets = useCallback(async () => {
    try {
      const petsData = await petsService.getAll();
      setPets(petsData.items);
    } catch (err) {
      console.error('Error loading pets:', err);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    loadPets();
  }, [loadEvents, loadPets]);

  // Toggle pet filter
  const togglePetFilter = (petId: string) => {
    setSelectedPetIds((prev) =>
      prev.includes(petId) ? prev.filter((id) => id !== petId) : [...prev, petId]
    );
  };

  // Export event to device calendar
  const handleExportEvent = async (event: CalendarEvent) => {
    const success = await exportEventToCalendar(event);
    if (success) {
      platformAlert.alert('Успіх', 'Подію додано до календаря телефону');
    }
  };

  // Export all day events
  const handleExportDayEvents = async () => {
    if (dayEvents.length === 0) {
      platformAlert.alert('Немає подій', 'На вибрану дату немає подій для експорту');
      return;
    }

    const count = await exportEventsToCalendar(dayEvents);
    platformAlert.alert(
      'Експорт завершено',
      `Експортовано ${count} з ${dayEvents.length} подій до календаря телефону`
    );
  };

  // Create new event
  const handleCreateEvent = async (data: CreateReminderDto) => {
    try {
      await remindersService.create(data);
      platformAlert.alert('Успіх', 'Подію створено та нагадування встановлено');
      // Force refresh events from store (bypasses cache)
      await refreshEvents();
    } catch (error) {
      throw error; // Let modal handle the error
    }
  };

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <ErrorState
          title="Помилка завантаження"
          message={error}
          onRetry={loadEvents}
          fullScreen
        />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${theme.bgPrimary}`}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={theme.gradientColors.orange}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}  
        >
          <View className="items-center gap-4 mt-4 rounded-b-[40px] px-6 pt-16 pb-12">
            <View className="relative">
              <View className="absolute bg-white/20 w-24 h-24 rounded-full blur-xl" />
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-white shadow-lg">
                <MaterialIcons name="calendar-today" size={40} color="#f97316" />
              </View>
            </View>
            
            <View className="items-center gap-2">
              <Text className="text-white text-3xl font-extrabold text-center">
                Календар подій
              </Text>
              <Text className="text-white text-base text-center opacity-90 px-4">
                Всі важливі події улюбленців в одному місці
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-6 pt-6 pb-8 gap-6">
          {/* Add Event Button */}
          <TouchableOpacity
            className="bg-orange-500 py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
            onPress={() => setIsCreateModalVisible(true)}>
            <MaterialIcons name="add" size={24} color="white" />
            <Text className="text-white font-bold text-lg">Додати подію</Text>
          </TouchableOpacity>

          {/* View Mode Toggle */}
          <View className={`flex-row gap-2 ${theme.isDark ? 'bg-gray-800' : 'bg-gray-100'} p-1 rounded-2xl`}>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                viewMode === 'month' ? (theme.isDark ? 'bg-gray-700 shadow-sm' : 'bg-white shadow-sm') : ''
              }`}
              onPress={() => setViewMode('month')}>
              <Text
                className={`font-bold ${
                  viewMode === 'month' ? 'text-orange-500' : theme.textSecondary
                }`}>
                Місяць
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                viewMode === 'day' ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => setViewMode('day')}>
              <Text
                className={`font-bold ${
                  viewMode === 'day' ? 'text-orange-500' : 'text-gray-600'
                }`}>
                День
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pet Filter */}
          {pets.length > 0 && (
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-3 ml-1">
                Фільтр за тваринами
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                <TouchableOpacity
                  className={`px-4 py-2 rounded-full border mr-2 ${
                    selectedPetIds.length === 0
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => setSelectedPetIds([])}>
                  <Text
                    className={`font-semibold text-sm ${
                      selectedPetIds.length === 0 ? 'text-white' : 'text-gray-700'
                    }`}>
                    Всі
                  </Text>
                </TouchableOpacity>
                {pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    className={`px-4 py-2 rounded-full border mr-2 ${
                      selectedPetIds.includes(pet.id)
                        ? 'bg-orange-500 border-orange-500'
                        : 'bg-white border-gray-300'
                    }`}
                    onPress={() => togglePetFilter(pet.id)}>
                    <Text
                      className={`font-semibold text-sm ${
                        selectedPetIds.includes(pet.id) ? 'text-white' : 'text-gray-700'
                      }`}>
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Calendar */}
          <View className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm">
            <Calendar
              current={selectedDate}
              onDayPress={(day: DateData) => {
                setSelectedDate(day.dateString);
                setViewMode('day');
              }}
              markedDates={markedDates}
              enableSwipeMonths={true}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#6b7280',
                selectedDayBackgroundColor: '#f97316',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#f97316',
                dayTextColor: '#1f2937',
                textDisabledColor: '#d1d5db',
                dotColor: '#f97316',
                selectedDotColor: '#ffffff',
                arrowColor: '#f97316',
                monthTextColor: '#1f2937',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              renderHeader={(date) => {
                const monthNames = [
                  'Січень',
                  'Лютий',
                  'Березень',
                  'Квітень',
                  'Травень',
                  'Червень',
                  'Липень',
                  'Серпень',
                  'Вересень',
                  'Жовтень',
                  'Листопад',
                  'Грудень',
                ];
                const month = monthNames[date.getMonth()];
                const year = date.getFullYear();
                return (
                  <View className="items-center py-4">
                    <Text className="text-xl font-bold text-gray-800">
                      {month} {year}
                    </Text>
                  </View>
                );
              }}
            />
          </View>

          {/* Day View - Events List */}
          {viewMode === 'day' && (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-xl font-bold text-gray-800">
                    {formatDate(selectedDate, 'long')}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {dayEvents.length} {dayEvents.length === 1 ? 'подія' : 'подій'}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="bg-orange-100 px-3 py-2 rounded-xl flex-row items-center gap-1"
                    onPress={() => {
                      setIsCreateModalVisible(true);
                    }}>
                    <MaterialIcons name="add" size={18} color="#f97316" />
                    <Text className="text-orange-600 font-semibold text-sm">Додати</Text>
                  </TouchableOpacity>
                  {dayEvents.length > 0 && (
                    <TouchableOpacity
                      className="bg-orange-500 px-3 py-2 rounded-xl flex-row items-center gap-1"
                      onPress={handleExportDayEvents}>
                      <MaterialIcons name="file-download" size={18} color="white" />
                      <Text className="text-white font-semibold text-sm">Експорт</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {isLoading ? (
                <LoadingSpinner text="Завантаження подій..." />
              ) : dayEvents.length === 0 ? (
                <EmptyState
                  title="Немає подій на цей день"
                  message="На вибрану дату не заплановано жодних подій"
                  icon="event-busy"
                  iconColor="#9ca3af"
                />
              ) : (
                <View>
                  {dayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onPress={() => handleExportEvent(event)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Month View - Upcoming Events */}
          {viewMode === 'month' && (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-800">Найближчі події</Text>
                <TouchableOpacity
                  className="bg-orange-500 px-4 py-2 rounded-xl flex-row items-center gap-2"
                  onPress={() => {
                    const upcoming = filteredEvents
                      .filter((e) => e.date >= selectedDate)
                      .slice(0, 5);
                    exportEventsToCalendar(upcoming).then((count) => {
                      platformAlert.alert(
                        'Експорт завершено',
                        `Експортовано ${count} подій до календаря телефону`
                      );
                    });
                  }}>
                  <MaterialIcons name="file-download" size={20} color="white" />
                  <Text className="text-white font-semibold text-sm">Експорт всіх</Text>
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <LoadingSpinner text="Завантаження подій..." />
              ) : filteredEvents.length === 0 ? (
                <EmptyState
                  title="Немає подій"
                  message="Поки що немає запланованих подій"
                  icon="event"
                  iconColor="#9ca3af"
                />
              ) : (
                <View>
                  {filteredEvents
                    .filter((e) => e.date >= selectedDate)
                    .slice(0, 10)
                    .map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onPress={() => handleExportEvent(event)}
                      />
                    ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Event Modal */}
      <CreateEventModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateEvent}
        pets={pets}
        selectedDate={selectedDate}
        selectedPetId={selectedPetIds.length === 1 ? selectedPetIds[0] : undefined}
      />
    </View>
  );
}
