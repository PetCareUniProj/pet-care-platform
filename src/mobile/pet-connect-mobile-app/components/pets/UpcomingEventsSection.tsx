// Upcoming events section for pet profile

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CalendarEvent, ReminderType } from '@/types/reminder.types';
import { remindersService } from '@/services/api';

interface UpcomingEventsSectionProps {
  petId: string;
  petName: string;
  maxEvents?: number;
}

const getEventIcon = (type: ReminderType): keyof typeof MaterialIcons.glyphMap => {
  switch (type) {
    case 'vaccination':
      return 'vaccines';
    case 'medication':
      return 'medication';
    case 'vet_visit':
      return 'local-hospital';
    case 'parasite_treatment':
      return 'bug-report';
    case 'grooming':
      return 'content-cut';
    default:
      return 'event';
  }
};

const getEventColor = (type: ReminderType): string => {
  switch (type) {
    case 'vaccination':
      return '#3b82f6';
    case 'medication':
      return '#10b981';
    case 'vet_visit':
      return '#ef4444';
    case 'parasite_treatment':
      return '#8b5cf6';
    case 'grooming':
      return '#f59e0b';
    default:
      return '#f97316';
  }
};

const formatEventDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return 'Сьогодні';
  if (isTomorrow) return 'Завтра';

  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
  });
};

export function UpcomingEventsSection({ petId, petName, maxEvents = 3 }: UpcomingEventsSectionProps) {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [petId]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const petEvents = await remindersService.getEventsForPet(petId, maxEvents);
      setEvents(petEvents);
    } catch (error) {
      console.error('Error loading pet events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAll = () => {
    // Navigate to calendar with pet filter
    router.push({
      pathname: '/(tabs)/calendar',
      params: { petId },
    });
  };

  return (
    <View className="gap-4 py-6 px-6">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-800">Найближчі події</Text>
        <TouchableOpacity
          onPress={handleViewAll}
          className="flex-row items-center gap-1 active:opacity-70">
          <Text className="text-orange-500 font-semibold text-sm">Переглянути всі</Text>
          <MaterialIcons name="chevron-right" size={18} color="#f97316" />
        </TouchableOpacity>
      </View>

      {/* Events List */}
      {isLoading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="small" color="#f97316" />
        </View>
      ) : events.length === 0 ? (
        <View className="py-6 items-center">
          <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-3">
            <MaterialIcons name="event-available" size={32} color="#9ca3af" />
          </View>
          <Text className="text-gray-500 text-center">
            Немає запланованих подій для {petName}
          </Text>
          <TouchableOpacity
            onPress={handleViewAll}
            className="mt-3 bg-orange-100 px-4 py-2 rounded-full">
            <Text className="text-orange-600 font-semibold text-sm">Додати подію</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="gap-3">
          {events.map((event) => {
            const icon = getEventIcon(event.type);
            const color = getEventColor(event.type);

            return (
              <TouchableOpacity
                key={event.id}
                className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex-row items-center gap-3 active:scale-[0.98]"
                onPress={handleViewAll}>
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}>
                  <MaterialIcons name={icon} size={22} color={color} />
                </View>

                <View className="flex-1">
                  <Text className="font-bold text-gray-800" numberOfLines={1}>
                    {event.title}
                  </Text>
                  <View className="flex-row items-center gap-2 mt-1">
                    <Text className="text-gray-500 text-sm">
                      {formatEventDate(event.date)}
                    </Text>
                    {event.time && (
                      <>
                        <Text className="text-gray-300">•</Text>
                        <Text className="text-gray-500 text-sm">{event.time}</Text>
                      </>
                    )}
                  </View>
                </View>

                <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}


