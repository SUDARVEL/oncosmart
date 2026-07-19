import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '../i18n';
import {
  getNextSession,
  sessionKey,
  UNLOCK_DELAY_MS,
} from './programProgress';

/** Stable id so we replace the previous “next exercise” reminder. */
export const NEXT_EXERCISE_NOTIFICATION_ID = 'next-exercise-ready';
export const EXERCISE_REMINDER_CHANNEL_ID = 'exercise-reminders';

let handlerConfigured = false;

function ensureNotificationHandler() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(EXERCISE_REMINDER_CHANNEL_ID, {
    name: 'Exercise reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  ensureNotificationHandler();
  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function cancelNextExerciseNotification(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(NEXT_EXERCISE_NOTIFICATION_ID);
  } catch {
    // Nothing scheduled yet.
  }
}

/**
 * Schedule a local notification at the device-local unlock time
 * (completedAt + 24h) for the next exercise day.
 */
export async function scheduleNextExerciseNotification(params: {
  level: number;
  dayInLevel: number;
  completedAt?: number;
}): Promise<void> {
  if (Platform.OS === 'web') return;

  const next = getNextSession(params.level, params.dayInLevel);
  if (!next) {
    await cancelNextExerciseNotification();
    return;
  }

  const completedAt = params.completedAt ?? Date.now();
  const unlockAt = completedAt + UNLOCK_DELAY_MS;

  // Device clock: only schedule future unlocks.
  if (unlockAt <= Date.now() + 5_000) {
    await cancelNextExerciseNotification();
    return;
  }

  const allowed = await ensureNotificationPermissions();
  if (!allowed) return;

  await cancelNextExerciseNotification();

  const title = i18n.t('notifications.nextExerciseTitle');
  const body = i18n.t('notifications.nextExerciseBody', {
    level: next.level,
    day: next.dayInLevel,
  });

  await Notifications.scheduleNotificationAsync({
    identifier: NEXT_EXERCISE_NOTIFICATION_ID,
    content: {
      title,
      body,
      sound: true,
      data: {
        type: 'next-exercise-ready',
        level: next.level,
        dayInLevel: next.dayInLevel,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(unlockAt),
      channelId: EXERCISE_REMINDER_CHANNEL_ID,
    },
  });
}

/** Re-schedule from persisted completions (app open / permission granted later). */
export async function syncNextExerciseNotification(
  completions: Record<string, number>,
): Promise<void> {
  if (Platform.OS === 'web') return;

  // Find the latest completed session; schedule for its next unlock if still future.
  let latestKey: string | null = null;
  let latestAt = 0;
  for (const [key, at] of Object.entries(completions)) {
    if (typeof at !== 'number' || !Number.isFinite(at)) continue;
    if (at >= latestAt) {
      latestAt = at;
      latestKey = key;
    }
  }

  if (!latestKey) {
    await cancelNextExerciseNotification();
    return;
  }

  const match = /^L(\d+)D(\d+)$/.exec(latestKey);
  if (!match) {
    await cancelNextExerciseNotification();
    return;
  }

  const level = Number(match[1]);
  const dayInLevel = Number(match[2]);
  const next = getNextSession(level, dayInLevel);
  if (!next) {
    await cancelNextExerciseNotification();
    return;
  }

  // If the next session is already completed, keep walking forward via latest completion.
  if (completions[sessionKey(next.level, next.dayInLevel)]) {
    await cancelNextExerciseNotification();
    return;
  }

  await scheduleNextExerciseNotification({
    level,
    dayInLevel,
    completedAt: latestAt,
  });
}
