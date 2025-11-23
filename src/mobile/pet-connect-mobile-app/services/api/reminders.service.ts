// Reminders service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import {
  Reminder,
  CreateReminderDto,
  UpdateReminderDto,
  CalendarEvent,
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
    return apiClient.get<CalendarEvent[]>(API_ENDPOINTS.CALENDAR.GET_EVENTS, {
      params: { startDate, endDate },
    });
  }
}

export const remindersService = new RemindersService();


