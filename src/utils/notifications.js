import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Request notification permissions. Returns false on any failure
 * rather than throwing, so it cannot crash the app.
 */
export async function requestPermissions() {
  try {
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
  } catch (e) {
    console.warn('Notification permission error:', e?.message || e);
    return false;
  }
}

/**
 * Configure the foreground notification handler.
 */
export function configureNotifications() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn('Notification handler config error:', e?.message || e);
  }
}

/**
 * Schedule birthday notifications for all contacts.
 * Failures are caught silently — notifications are non-critical.
 */
export async function scheduleBirthdayNotifications(contacts, t) {
  if (!contacts || contacts.length === 0) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.warn('Could not cancel existing notifications:', e?.message || e);
    return;
  }

  const today = new Date();
  const currentYear = today.getFullYear();

  for (const contact of contacts) {
    if (!contact.birthday) continue;

    let bd;
    try {
      bd = new Date(contact.birthday);
      if (isNaN(bd.getTime())) continue;
    } catch (e) {
      continue;
    }

    const bdMonth = bd.getMonth();
    const bdDay = bd.getDate();
    const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Contact';

    for (const year of [currentYear, currentYear + 1]) {
      const notifDate = new Date(year, bdMonth, bdDay, 9, 0, 0);
      if (notifDate <= today) continue;

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t?.birthdayNotifTitle ? t.birthdayNotifTitle(name) : `🎂 ${name}'s birthday!`,
            body: t?.birthdayNotifBody
              ? t.birthdayNotifBody(name)
              : `Don't forget to wish ${name} a happy birthday today!`,
            data: { contactId: contact.id },
            ...(Platform.OS === 'android' && { channelId: 'birthdays' }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notifDate,
          },
        });
      } catch (e) {
        console.warn(`Could not schedule notification for ${name}:`, e?.message || e);
      }
    }
  }
}
