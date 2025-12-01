import { Alert, Platform } from 'react-native';

type AlertButton = {
  text?: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
};

/**
 * Platform-aware alert utility
 * Shows alerts only on mobile platforms (iOS/Android)
 * On web, executes actions directly without confirmation for confirm dialogs,
 * or ignores informational alerts
 */
export const platformAlert = {
  /**
   * Shows an alert with title and message
   * On web: ignores informational alerts, executes confirm actions directly
   */
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: { cancelable?: boolean }
  ) => {
    if (Platform.OS === 'web') {
      // On web, for confirm dialogs, execute the confirm action directly
      if (buttons && buttons.length > 0) {
        // Find the confirm button (destructive style or non-cancel button)
        // Priority: destructive > non-cancel > last button
        const confirmButton =
          buttons.find((btn) => btn.style === 'destructive') ||
          buttons.find((btn) => btn.style !== 'cancel') ||
          buttons[buttons.length - 1];
        
        // Execute the confirm action if it exists
        if (confirmButton?.onPress) {
          confirmButton.onPress();
        }
      }
      // For informational alerts, just log to console
      else {
        console.log(`[Alert] ${title}: ${message || ''}`);
      }
      return;
    }

    // On mobile platforms, use native Alert
    if (buttons && buttons.length > 0) {
      Alert.alert(title, message, buttons, options);
    } else {
      Alert.alert(title, message);
    }
  },
};

