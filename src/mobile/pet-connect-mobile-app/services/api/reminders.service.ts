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

    // Note: Notifications are not scheduled automatically
    // They can be scheduled later if needed

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
    
    // Cancel notification
    await cancelNotification(id);
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
    
    // Get mock events from vet clinic
    const mockEvents = this.getMockCalendarEvents(startDate, endDate);
    
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
        const maxOccurrences = 50; // Limit to prevent infinite loops

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

          // Move to next occurrence
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

  // ============ Mock Data ============

  private getMockCalendarEvents(startDate: string, endDate: string): CalendarEvent[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const events: CalendarEvent[] = [];
    
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
    
    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    
    let currentDate = new Date(start);
    let eventId = 1;
    
    // Generate events every 3-5 days
    while (currentDate <= end) {
      const daysSinceStart = Math.floor((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceStart % 4 === 0 || (daysSinceStart % 4 === 1 && Math.random() > 0.6)) {
        const eventsCount = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < eventsCount; i++) {
          const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const titles = eventTitles[type];
          const title = titles[Math.floor(Math.random() * titles.length)];
          const pet = pets[Math.floor(Math.random() * pets.length)];
          const time = times[Math.floor(Math.random() * times.length)];
          
          events.push({
            id: `mock-event-${eventId++}`,
            title: title,
            date: currentDate.toISOString().split('T')[0],
            time: time,
            type: type,
            petId: pet.id,
            petName: pet.name,
          });
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return events;
  }
}

export const remindersService = new RemindersService();
