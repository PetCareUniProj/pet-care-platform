// Calendar utilities for exporting events

import * as Calendar from 'expo-calendar';
import { CalendarEvent } from '@/types/reminder.types';
import { Platform, Alert } from 'react-native';

/**
 * Request calendar permissions
 */
export async function requestCalendarPermissions(): Promise<boolean> {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
}

/**
 * Get default calendar ID
 */
export async function getDefaultCalendarId(): Promise<string | null> {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(
      (cal) => cal.source.type === Calendar.SourceType.LOCAL || cal.isPrimary
    );
    return defaultCalendar?.id || calendars[0]?.id || null;
  } catch (error) {
    console.error('Error getting default calendar:', error);
    return null;
  }
}

/**
 * Export event to device calendar
 */
export async function exportEventToCalendar(event: CalendarEvent): Promise<boolean> {
  try {
    // Request permissions
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Дозвіл потрібен',
        'Для експорту подій потрібен дозвіл на доступ до календаря'
      );
      return false;
    }

    // Get calendar ID
    const calendarId = await getDefaultCalendarId();
    if (!calendarId) {
      Alert.alert('Помилка', 'Не вдалося знайти календар для експорту');
      return false;
    }

    // Parse date and time
    const eventDate = new Date(event.date);
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    } else {
      eventDate.setHours(9, 0, 0, 0); // Default to 9 AM
    }

    // Create end date (1 hour after start)
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1);

    // Create calendar event
    const eventId = await Calendar.createEventAsync(calendarId, {
      title: `${event.title} - ${event.petName}`,
      startDate: eventDate,
      endDate: endDate,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notes: event.reminderId ? `ID нагадування: ${event.reminderId}` : undefined,
      alarms: [
        {
          relativeOffset: -30, // 30 minutes before
          method: Calendar.AlarmMethod.ALERT,
        },
      ],
    });

    return !!eventId;
  } catch (error: any) {
    console.error('Error exporting event to calendar:', error);
    Alert.alert('Помилка', error.message || 'Не вдалося експортувати подію');
    return false;
  }
}

/**
 * Export multiple events to calendar
 */
export async function exportEventsToCalendar(events: CalendarEvent[]): Promise<number> {
  let successCount = 0;
  
  for (const event of events) {
    const success = await exportEventToCalendar(event);
    if (success) {
      successCount++;
    }
  }

  return successCount;
}

