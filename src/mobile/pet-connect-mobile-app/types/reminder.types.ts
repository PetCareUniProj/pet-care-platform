// Reminder types

export type ReminderType =
  | 'vaccination'
  | 'medication'
  | 'vet_visit'
  | 'parasite_treatment'
  | 'grooming'
  | 'custom';

export type ReminderStatus = 'upcoming' | 'completed' | 'missed' | 'snoozed';

export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Reminder {
  id: string;
  petId: string;
  type: ReminderType;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  frequency: ReminderFrequency;
  status: ReminderStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  snoozedUntil?: string;
}

export interface CreateReminderDto {
  petId: string;
  type: ReminderType;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  frequency: ReminderFrequency;
}

export interface UpdateReminderDto extends Partial<CreateReminderDto> {
  status?: ReminderStatus;
  isActive?: boolean;
  snoozedUntil?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: ReminderType;
  petId: string;
  petName: string;
  reminderId?: string;
}


