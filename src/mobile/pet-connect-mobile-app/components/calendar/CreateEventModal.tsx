// Modal for creating calendar events/reminders

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ReminderType, ReminderFrequency, CreateReminderDto } from '@/types/reminder.types';
import { Pet } from '@/types/pet.types';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReminderDto) => Promise<void>;
  pets: Pet[];
  selectedDate?: string;
  selectedPetId?: string;
}

// Event type options
const EVENT_TYPES: { type: ReminderType; label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
  { type: 'vaccination', label: 'Вакцинація', icon: 'vaccines', color: '#3b82f6' },
  { type: 'vet_visit', label: 'Візит до ветеринара', icon: 'local-hospital', color: '#ef4444' },
  { type: 'medication', label: 'Прийом ліків', icon: 'medication', color: '#10b981' },
  { type: 'parasite_treatment', label: 'Обробка від паразитів', icon: 'bug-report', color: '#8b5cf6' },
  { type: 'grooming', label: 'Стрижка / Догляд', icon: 'content-cut', color: '#f59e0b' },
  { type: 'custom', label: 'Інше', icon: 'event', color: '#6b7280' },
];

// Frequency options
const FREQUENCY_OPTIONS: { value: ReminderFrequency; label: string }[] = [
  { value: 'once', label: 'Одноразово' },
  { value: 'daily', label: 'Щодня' },
  { value: 'weekly', label: 'Щотижня' },
  { value: 'monthly', label: 'Щомісяця' },
  { value: 'yearly', label: 'Щороку' },
];

// Reminder time options (minutes before event)
const REMINDER_TIME_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: '5 хвилин' },
  { value: 15, label: '15 хвилин' },
  { value: 30, label: '30 хвилин' },
  { value: 60, label: '1 година' },
  { value: 120, label: '2 години' },
  { value: 1440, label: '1 день' },
];

export function CreateEventModal({
  visible,
  onClose,
  onSubmit,
  pets,
  selectedDate,
  selectedPetId,
}: CreateEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [selectedType, setSelectedType] = useState<ReminderType>('vet_visit');
  const [selectedPet, setSelectedPet] = useState<string>(selectedPetId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(
    selectedDate ? new Date(selectedDate) : new Date()
  );
  const [time, setTime] = useState<Date>(new Date());
  const [frequency, setFrequency] = useState<ReminderFrequency>('once');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(30);
  
  // Date/Time picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Update selected pet when prop changes
  useEffect(() => {
    if (selectedPetId) {
      setSelectedPet(selectedPetId);
    }
  }, [selectedPetId]);

  // Update date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  // Auto-fill title based on type
  useEffect(() => {
    const typeInfo = EVENT_TYPES.find((t) => t.type === selectedType);
    if (typeInfo && !title) {
      setTitle(typeInfo.label);
    }
  }, [selectedType]);

  const resetForm = () => {
    setSelectedType('vet_visit');
    setSelectedPet(selectedPetId || '');
    setTitle('');
    setDescription('');
    setDate(selectedDate ? new Date(selectedDate) : new Date());
    setTime(new Date());
    setFrequency('once');
    setReminderMinutesBefore(30);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedPet) {
      Alert.alert('Помилка', 'Оберіть тварину');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Помилка', 'Введіть назву події');
      return;
    }

    setIsSubmitting(true);
    try {
      const dueDate = date.toISOString().split('T')[0];
      const dueTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

      await onSubmit({
        petId: selectedPet,
        type: selectedType,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        dueTime,
        frequency,
        reminderMinutesBefore,
      });

      handleClose();
    } catch (error) {
      Alert.alert('Помилка', (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setDate(selected);
    }
  };

  const onTimeChange = (_: any, selected?: Date) => {
    setShowTimePicker(false);
    if (selected) {
      setTime(selected);
    }
  };

  const formatDate = (d: Date): string => {
    return d.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (t: Date): string => {
    return t.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Нова подія</Text>
            <TouchableOpacity onPress={handleClose} className="p-2">
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {/* Event Type Selection */}
            <View className="mb-6">
              <Text className="text-sm font-bold text-gray-700 mb-3">Тип події</Text>
              <View className="flex-row flex-wrap gap-2">
                {EVENT_TYPES.map((eventType) => (
                  <TouchableOpacity
                    key={eventType.type}
                    className={`flex-row items-center gap-2 px-4 py-3 rounded-xl border ${
                      selectedType === eventType.type
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => {
                      setSelectedType(eventType.type);
                      if (eventType.type !== 'custom') {
                        setTitle(eventType.label);
                      } else {
                        setTitle('');
                      }
                    }}>
                    <MaterialIcons
                      name={eventType.icon}
                      size={20}
                      color={selectedType === eventType.type ? '#f97316' : eventType.color}
                    />
                    <Text
                      className={`font-semibold text-sm ${
                        selectedType === eventType.type ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                      {eventType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pet Selection */}
            <View className="mb-6">
              <Text className="text-sm font-bold text-gray-700 mb-3">Тварина</Text>
              <View className="flex-row flex-wrap gap-2">
                {pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    className={`px-4 py-3 rounded-xl border ${
                      selectedPet === pet.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => setSelectedPet(pet.id)}>
                    <Text
                      className={`font-semibold ${
                        selectedPet === pet.id ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {pets.length === 0 && (
                <Text className="text-gray-400 italic">Спершу додайте тварину</Text>
              )}
            </View>

            {/* Title Input */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2">Назва події</Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 text-gray-800"
                placeholder="Введіть назву події"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description Input */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-gray-700 mb-2">Опис (необов'язково)</Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 text-gray-800 h-20"
                placeholder="Додаткова інформація"
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Date & Time */}
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-700 mb-2">Дата</Text>
                <TouchableOpacity
                  className="border border-gray-200 rounded-xl p-4 flex-row items-center gap-2"
                  onPress={() => setShowDatePicker(true)}>
                  <MaterialIcons name="calendar-today" size={20} color="#f97316" />
                  <Text className="text-gray-800">{formatDate(date)}</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-700 mb-2">Час</Text>
                <TouchableOpacity
                  className="border border-gray-200 rounded-xl p-4 flex-row items-center gap-2"
                  onPress={() => setShowTimePicker(true)}>
                  <MaterialIcons name="access-time" size={20} color="#f97316" />
                  <Text className="text-gray-800">{formatTime(time)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Frequency Selection */}
            <View className="mb-6">
              <Text className="text-sm font-bold text-gray-700 mb-3">Періодичність</Text>
              <View className="flex-row flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`px-4 py-3 rounded-xl border ${
                      frequency === option.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => setFrequency(option.value)}>
                    <Text
                      className={`font-semibold text-sm ${
                        frequency === option.value ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reminder Time Selection */}
            <View className="mb-8">
              <Text className="text-sm font-bold text-gray-700 mb-3">Нагадування за</Text>
              <View className="flex-row flex-wrap gap-2">
                {REMINDER_TIME_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`px-4 py-3 rounded-xl border ${
                      reminderMinutesBefore === option.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                    onPress={() => setReminderMinutesBefore(option.value)}>
                    <Text
                      className={`font-semibold text-sm ${
                        reminderMinutesBefore === option.value ? 'text-orange-600' : 'text-gray-700'
                      }`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="p-6 pt-4 border-t border-gray-200">
            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${
                isSubmitting ? 'bg-orange-300' : 'bg-orange-500'
              }`}
              onPress={handleSubmit}
              disabled={isSubmitting}>
              <Text className="text-white font-bold text-lg">
                {isSubmitting ? 'Створення...' : 'Створити подію'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
              themeVariant="light"
              accentColor="#f97316"
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
              is24Hour={true}
              themeVariant="light"
              accentColor="#f97316"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}


