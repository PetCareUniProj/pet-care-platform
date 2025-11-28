// Reminders service - mocked for vet clinic integration

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import {
  Reminder,
  CreateReminderDto,
  UpdateReminderDto,
  CalendarEvent,
  ReminderType,
  ReminderFrequency,
} from '@/types/reminder.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const REMINDERS_STORAGE_KEY = '@pet_connect_reminders';
const MOCK_EVENTS_STORAGE_KEY = '@pet_connect_mock_events';
const MOCK_EVENTS_GENERATED_KEY = '@pet_connect_mock_events_generated';

class RemindersService {
  // ============ Real API calls (for future backend integration) ============
  
  async getAll(petId?: string): Promise<Reminder[]> {
    // For now, use local storage
    return this.getLocalReminders(petId);
  }

  async getById(id: string): Promise<Reminder | null> {
    const reminders = await this.getLocalReminders();
    return reminders.find((r) => r.id === id) || null;
  }

  async create(data: CreateReminderDto): Promise<Reminder> {
    const now = new Date().toISOString();
    const newReminder: Reminder = {
      id: Crypto.randomUUID(),
      petId: data.petId,
      type: data.type,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      frequency: data.frequency,
      status: 'upcoming',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    // Save to local storage
    const reminders = await this.getLocalReminders();
    reminders.push(newReminder);
    await this.saveLocalReminders(reminders);

    return newReminder;
  }

  async update(id: string, data: UpdateReminderDto): Promise<Reminder | null> {
    const reminders = await this.getLocalReminders();
    const index = reminders.findIndex((r) => r.id === id);
    
    if (index === -1) return null;

    reminders[index] = {
      ...reminders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.saveLocalReminders(reminders);
    return reminders[index];
  }

  async delete(id: string): Promise<void> {
    const reminders = await this.getLocalReminders();
    const filtered = reminders.filter((r) => r.id !== id);
    await this.saveLocalReminders(filtered);
  }

  async complete(id: string): Promise<Reminder | null> {
    return this.update(id, {
      status: 'completed',
    });
  }

  // ============ Calendar Events ============

  async getCalendarEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    // Get local reminders
    const reminders = await this.getLocalReminders();
    
    // Convert reminders to calendar events
    const reminderEvents = await this.remindersToCalendarEvents(reminders, startDate, endDate);
    
    // Get or generate mock events (persisted)
    const mockEvents = await this.getOrGenerateMockEvents(startDate, endDate);
    
    // Combine and sort by date
    const allEvents = [...reminderEvents, ...mockEvents];
    allEvents.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.time || '00:00').localeCompare(b.time || '00:00');
    });

    return allEvents;
  }

  async getEventsForPet(petId: string, limit?: number): Promise<CalendarEvent[]> {
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    const allEvents = await this.getCalendarEvents(today, endDate.toISOString().split('T')[0]);
    const petEvents = allEvents.filter((e) => e.petId === petId);
    
    return limit ? petEvents.slice(0, limit) : petEvents;
  }

  // ============ Local Storage Helpers ============

  private async getLocalReminders(petId?: string): Promise<Reminder[]> {
    try {
      const data = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
      let reminders: Reminder[] = data ? JSON.parse(data) : [];
      
      if (petId) {
        reminders = reminders.filter((r) => r.petId === petId);
      }
      
      return reminders;
    } catch (error) {
      console.error('Error getting local reminders:', error);
      return [];
    }
  }

  private async saveLocalReminders(reminders: Reminder[]): Promise<void> {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving local reminders:', error);
    }
  }

  private async getPetName(petId: string): Promise<string> {
    // Mock pet names - in real app, would fetch from pets service
    const petNames: Record<string, string> = {
      '1': 'Мурзик',
      '2': 'Барон',
    };
    return petNames[petId] || 'Улюбленець';
  }

  private async remindersToCalendarEvents(
    reminders: Reminder[],
    startDate: string,
    endDate: string
  ): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const reminder of reminders) {
      if (!reminder.isActive) continue;

      const reminderDate = new Date(reminder.dueDate);
      
      // For one-time reminders
      if (reminder.frequency === 'once') {
        if (reminderDate >= start && reminderDate <= end) {
          events.push({
            id: `reminder-${reminder.id}`,
            title: reminder.title,
            date: reminder.dueDate,
            time: reminder.dueTime,
            type: reminder.type,
            petId: reminder.petId,
            petName: await this.getPetName(reminder.petId),
            reminderId: reminder.id,
          });
        }
      } else {
        // For recurring reminders, generate occurrences
        let currentDate = new Date(reminder.dueDate);
        let occurrence = 0;
        const maxOccurrences = 50;

        while (currentDate <= end && occurrence < maxOccurrences) {
          if (currentDate >= start) {
            events.push({
              id: `reminder-${reminder.id}-${occurrence}`,
              title: reminder.title,
              date: currentDate.toISOString().split('T')[0],
              time: reminder.dueTime,
              type: reminder.type,
              petId: reminder.petId,
              petName: await this.getPetName(reminder.petId),
              reminderId: reminder.id,
            });
          }

          switch (reminder.frequency) {
            case 'daily':
              currentDate.setDate(currentDate.getDate() + 1);
              break;
            case 'weekly':
              currentDate.setDate(currentDate.getDate() + 7);
              break;
            case 'monthly':
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
            case 'yearly':
              currentDate.setFullYear(currentDate.getFullYear() + 1);
              break;
          }
          occurrence++;
        }
      }
    }

    return events;
  }

  // ============ Mock Data (Persisted) ============

  private async getOrGenerateMockEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      // Check if we already generated mock events
      const generated = await AsyncStorage.getItem(MOCK_EVENTS_GENERATED_KEY);
      const storedEvents = await AsyncStorage.getItem(MOCK_EVENTS_STORAGE_KEY);
      
      if (generated && storedEvents) {
        const events: CalendarEvent[] = JSON.parse(storedEvents);
        // Filter events within date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        return events.filter(e => {
          const eventDate = new Date(e.date);
          return eventDate >= start && eventDate <= end;
        });
      }
      
      // Generate and persist mock events
      const mockEvents = this.generateMockEvents();
      await AsyncStorage.setItem(MOCK_EVENTS_STORAGE_KEY, JSON.stringify(mockEvents));
      await AsyncStorage.setItem(MOCK_EVENTS_GENERATED_KEY, 'true');
      
      // Filter events within date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      return mockEvents.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= start && eventDate <= end;
      });
    } catch (error) {
      console.error('Error getting mock events:', error);
      return [];
    }
  }

  private generateMockEvents(): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const now = new Date();
    
    const eventTypes: ReminderType[] = ['vaccination', 'vet_visit', 'medication', 'parasite_treatment', 'grooming'];
    const eventTitles: Record<ReminderType, string[]> = {
      vaccination: ['Вакцинація', 'Щорічна вакцинація', 'Ревакцинація', 'Комплексна вакцинація'],
      vet_visit: ['Візит до ветеринара', 'Плановий огляд', 'Консультація', 'Огляд після лікування'],
      medication: ['Прийом ліків', 'Прийом вітамінів', 'Курс лікування', 'Профілактичний прийом'],
      parasite_treatment: ['Обробка від паразитів', 'Профілактика паразитів', 'Дегельмінтизація'],
      grooming: ['Стрижка', 'Стрижка кігтів', 'Грумінг', 'Косметичний догляд'],
      custom: ['Інша подія'],
    };
    
    const pets = [
      { id: '1', name: 'Мурзик' },
      { id: '2', name: 'Барон' },
    ];
    
    const times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    
    // Generate events for next 6 months with deterministic seed
    for (let dayOffset = 0; dayOffset < 180; dayOffset += 3) {
      const eventDate = new Date(now);
      eventDate.setDate(eventDate.getDate() + dayOffset);
      
      // Use day of year as pseudo-random seed
      const dayOfYear = Math.floor((eventDate.getTime() - new Date(eventDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const shouldHaveEvent = (dayOfYear * 7) % 11 < 4;
      
      if (shouldHaveEvent) {
        const eventsCount = ((dayOfYear * 3) % 2) + 1;
        
        for (let i = 0; i < eventsCount; i++) {
          const typeIndex = (dayOfYear + i * 3) % eventTypes.length;
          const type = eventTypes[typeIndex];
          const titles = eventTitles[type];
          const titleIndex = (dayOfYear + i) % titles.length;
          const petIndex = (dayOfYear + i * 2) % pets.length;
          const timeIndex = (dayOfYear + i * 5) % times.length;
          
          events.push({
            id: `mock-event-${dayOffset}-${i}`,
            title: titles[titleIndex],
            date: eventDate.toISOString().split('T')[0],
            time: times[timeIndex],
            type: type,
            petId: pets[petIndex].id,
            petName: pets[petIndex].name,
          });
        }
      }
    }
    
    return events;
  }

  // Clear mock events (for testing)
  async resetMockEvents(): Promise<void> {
    await AsyncStorage.removeItem(MOCK_EVENTS_STORAGE_KEY);
    await AsyncStorage.removeItem(MOCK_EVENTS_GENERATED_KEY);
  }
}

export const remindersService = new RemindersService();
