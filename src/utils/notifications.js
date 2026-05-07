import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Request notification permissions
 */
export async function requestPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return false;
  }

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('birthdays', {
      name: 'Anniversaires',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
    });
  }

  return true;
}

/**
 * Configure notification handler
 */
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Schedule birthday notifications for all contacts
 * Cancels existing ones and re-schedules
 */
export async function scheduleBirthdayNotifications(contacts) {
  // Cancel all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date();
  const currentYear = today.getFullYear();

  for (const contact of contacts) {
    if (!contact.birthday) continue;

    const bd = new Date(contact.birthday);
    const bdMonth = bd.getMonth();
    const bdDay = bd.getDate();

    // Schedule for this year and next year
    for (const year of [currentYear, currentYear + 1]) {
      const notifDate = new Date(year, bdMonth, bdDay, 9, 0, 0); // 9 AM

      // Skip if already past
      if (notifDate <= today) continue;

      const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🎂 Anniversaire de ${name} !`,
            body: `N'oublie pas de souhaiter un joyeux anniversaire à ${name} aujourd'hui !`,
            data: { contactId: contact.id },
            ...(Platform.OS === 'android' && { channelId: 'birthdays' }),
          },
          trigger: {
            type: 'date',
            date: notifDate,
          },
        });
      } catch (e) {
        console.warn(`Could not schedule notification for ${name}:`, e.message);
      }
    }
  }
}
