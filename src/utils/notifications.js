import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Request notification permissions.
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

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('birthdays', {
      name: 'Birthdays',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
    });
  }

  return true;
}

/**
 * Configure the notification handler.
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
 * Schedule birthday notifications for all contacts.
 * Cancels existing ones and re-schedules.
 * @param {Array} contacts
 * @param {object} t - translation object (must have birthdayNotifTitle, birthdayNotifBody)
 */
export async function scheduleBirthdayNotifications(contacts, t) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date();
  const currentYear = today.getFullYear();

  for (const contact of contacts) {
    if (!contact.birthday) continue;

    const bd = new Date(contact.birthday);
    const bdMonth = bd.getMonth();
    const bdDay = bd.getDate();
    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();

    for (const year of [currentYear, currentYear + 1]) {
      const notifDate = new Date(year, bdMonth, bdDay, 9, 0, 0);
      if (notifDate <= today) continue;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t ? t.birthdayNotifTitle(name) : `🎂 ${name}'s birthday!`,
            body: t ? t.birthdayNotifBody(name) : `Don't forget to wish ${name} a happy birthday today!`,
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
