// Event Card component for calendar

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CalendarEvent, ReminderType } from '@/types/reminder.types';
import { formatDate, formatTime } from '@/utils/format';

interface EventCardProps {
  event: CalendarEvent;
  onPress?: (event: CalendarEvent) => void;
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
      return '#3b82f6'; // blue
    case 'medication':
      return '#10b981'; // green
    case 'vet_visit':
      return '#ef4444'; // red
    case 'parasite_treatment':
      return '#8b5cf6'; // purple
    case 'grooming':
      return '#f59e0b'; // amber
    default:
      return '#f97316'; // orange
  }
};

const getEventTypeLabel = (type: ReminderType): string => {
  switch (type) {
    case 'vaccination':
      return 'Вакцинація';
    case 'medication':
      return 'Ліки';
    case 'vet_visit':
      return 'Візит до ветеринара';
    case 'parasite_treatment':
      return 'Обробка від паразитів';
    case 'grooming':
      return 'Стрижка';
    default:
      return 'Подія';
  }
};

export function EventCard({ event, onPress }: EventCardProps) {
  const icon = getEventIcon(event.type);
  const color = getEventColor(event.type);
  const typeLabel = getEventTypeLabel(event.type);

  return (
    <TouchableOpacity
      className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm active:scale-[0.98]"
      onPress={() => onPress?.(event)}>
      <View className="flex-row items-start gap-3">
        <View className={`p-2 rounded-xl`} style={{ backgroundColor: `${color}15` }}>
          <MaterialIcons name={icon} size={24} color={color} />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-bold text-gray-800 text-base flex-1">
              {event.title}
            </Text>
            <View className={`px-2 py-1 rounded-full`} style={{ backgroundColor: `${color}20` }}>
              <Text className="text-xs font-semibold" style={{ color }}>
                {typeLabel}
              </Text>
            </View>
          </View>
          
          <Text className="text-gray-600 text-sm mb-2">
            {event.petName}
          </Text>
          
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <MaterialIcons name="calendar-today" size={14} color="#9ca3af" />
              <Text className="text-gray-500 text-xs">
                {formatDate(event.date, 'short')}
              </Text>
            </View>
            {event.time && (
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="access-time" size={14} color="#9ca3af" />
                <Text className="text-gray-500 text-xs">
                  {event.time}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

