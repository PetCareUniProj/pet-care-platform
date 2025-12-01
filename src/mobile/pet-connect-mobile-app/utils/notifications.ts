// Push notifications utilities using expo-notifications

import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { CalendarEvent, ReminderFrequency } from '@/types/reminder.types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Дозвіл потрібен',
        'Для отримання нагадувань потрібен дозвіл на сповіщення'
      );
      return false;
    }

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Нагадування',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f97316',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a notification for an event
 */
export async function scheduleEventNotification(
  event: CalendarEvent,
  reminderMinutesBefore: number = 30
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Parse event date and time
    const eventDate = new Date(event.date);
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    } else {
      eventDate.setHours(9, 0, 0, 0); // Default to 9 AM
    }

    // Calculate notification time (before event)
    const notificationTime = new Date(eventDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - reminderMinutesBefore);

    // Don't schedule if notification time is in the past
    if (notificationTime <= new Date()) {
      console.log('Notification time is in the past, skipping');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🐾 ${event.title}`,
        body: `Подія для ${event.petName} о ${event.time || '09:00'}`,
        data: { eventId: event.id, petId: event.petId },
        sound: 'default',
      },
      trigger: {
        date: notificationTime,
        channelId: Platform.OS === 'android' ? 'reminders' : undefined,
      } as Notifications.DateTriggerInput,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Schedule recurring notifications based on frequency
 */
export async function scheduleRecurringNotification(
  event: CalendarEvent,
  frequency: ReminderFrequency,
  reminderMinutesBefore: number = 30
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Parse event date and time
    const eventDate = new Date(event.date);
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    } else {
      eventDate.setHours(9, 0, 0, 0);
    }

    // Calculate notification time
    const notificationTime = new Date(eventDate);
    notificationTime.setMinutes(notificationTime.getMinutes() - reminderMinutesBefore);

    // For recurring notifications, we schedule the first one
    // and set up the recurrence pattern
    let trigger: Notifications.NotificationTriggerInput;

    switch (frequency) {
      case 'daily':
        trigger = {
          hour: notificationTime.getHours(),
          minute: notificationTime.getMinutes(),
          repeats: true,
          channelId: Platform.OS === 'android' ? 'reminders' : undefined,
        } as Notifications.CalendarTriggerInput;
        break;
      case 'weekly':
        trigger = {
          weekday: notificationTime.getDay() + 1, // 1-7 (Sunday = 1)
          hour: notificationTime.getHours(),
          minute: notificationTime.getMinutes(),
          repeats: true,
          channelId: Platform.OS === 'android' ? 'reminders' : undefined,
        } as Notifications.CalendarTriggerInput;
        break;
      case 'monthly':
        // For monthly, we schedule the next occurrence
        // expo-notifications doesn't support monthly repeats directly
        // so we schedule the first one and reschedule after it fires
        if (notificationTime <= new Date()) {
          notificationTime.setMonth(notificationTime.getMonth() + 1);
        }
        trigger = {
          date: notificationTime,
          channelId: Platform.OS === 'android' ? 'reminders' : undefined,
        } as Notifications.DateTriggerInput;
        break;
      case 'yearly':
        if (notificationTime <= new Date()) {
          notificationTime.setFullYear(notificationTime.getFullYear() + 1);
        }
        trigger = {
          date: notificationTime,
          channelId: Platform.OS === 'android' ? 'reminders' : undefined,
        } as Notifications.DateTriggerInput;
        break;
      default: // 'once'
        if (notificationTime <= new Date()) {
          return null;
        }
        trigger = {
          date: notificationTime,
          channelId: Platform.OS === 'android' ? 'reminders' : undefined,
        } as Notifications.DateTriggerInput;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🐾 ${event.title}`,
        body: `Подія для ${event.petName} о ${event.time || '09:00'}`,
        data: { 
          eventId: event.id, 
          petId: event.petId,
          frequency,
        },
        sound: 'default',
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling recurring notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}


