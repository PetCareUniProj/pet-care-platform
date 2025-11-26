// Reminders service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import {
  Reminder,
  CreateReminderDto,
  UpdateReminderDto,
  CalendarEvent,
  ReminderType,
} from '@/types/reminder.types';

class RemindersService {
  async getAll(petId?: string): Promise<Reminder[]> {
    const params = petId ? { petId } : {};
    return apiClient.get<Reminder[]>(API_ENDPOINTS.REMINDERS.GET_ALL, { params });
  }

  async getById(id: string): Promise<Reminder> {
    return apiClient.get<Reminder>(API_ENDPOINTS.REMINDERS.UPDATE(id));
  }

  async create(data: CreateReminderDto): Promise<Reminder> {
    return apiClient.post<Reminder>(API_ENDPOINTS.REMINDERS.CREATE, data);
  }

  async update(id: string, data: UpdateReminderDto): Promise<Reminder> {
    return apiClient.put<Reminder>(API_ENDPOINTS.REMINDERS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.REMINDERS.DELETE(id));
  }

  async complete(id: string): Promise<Reminder> {
    return apiClient.post<Reminder>(API_ENDPOINTS.REMINDERS.COMPLETE(id));
  }

  async getCalendarEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    // Mock data for vet clinic - return mock events for the period
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.getMockCalendarEvents(startDate, endDate);
  }

  // Generate mock calendar events for vet clinic
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
    };
    
    const pets = [
      { id: '1', name: 'Мурзик' },
      { id: '2', name: 'Барон' },
    ];
    
    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    
    let currentDate = new Date(start);
    let eventId = 1;
    
    // Generate events every 2-3 days
    while (currentDate <= end) {
      // Randomly decide if we should add events on this day (every 2-3 days)
      const daysSinceStart = Math.floor((currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceStart % 3 === 0 || (daysSinceStart % 3 === 1 && Math.random() > 0.5)) {
        // 1-3 events per day
        const eventsCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < eventsCount; i++) {
          const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const titles = eventTitles[type];
          const title = titles[Math.floor(Math.random() * titles.length)];
          const pet = pets[Math.floor(Math.random() * pets.length)];
          const time = times[Math.floor(Math.random() * times.length)];
          
          events.push({
            id: `mock-event-${eventId++}`,
            title: `${title} ${pet.name}`,
            date: currentDate.toISOString().split('T')[0],
            time: time,
            type: type,
            petId: pet.id,
            petName: pet.name,
            reminderId: `rem-${eventId}`,
          });
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return events;
  }
}

export const remindersService = new RemindersService();


