import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import i18n from '../i18n';
import {
  getNextSession,
  parseSessionKey,
  sessionKey,
  UNLOCK_DELAY_MS,
} from './programProgress';

/** Stable id so we replace the previous “next exercise” reminder. */
export const NEXT_EXERCISE_NOTIFICATION_ID = 'next-exercise-ready';
export const DAY_COMPLETED_NOTIFICATION_ID = 'day-completed';
export const EXERCISE_REMINDER_CHANNEL_ID = 'exercise-reminders';

const NOTIFIED_UNLOCK_AT_KEY = 'oncosmart.notifications.notifiedUnlockAt';

let handlerConfigured = false;

async function getNotifiedUnlockAt(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFIED_UNLOCK_AT_KEY);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

async function setNotifiedUnlockAt(unlockAt: number): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFIED_UNLOCK_AT_KEY, String(unlockAt));
  } catch {
    // ignore
  }
}

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
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
}

function isGranted(
  status: Notifications.NotificationPermissionsStatus,
): boolean {
  return (
    status.granted ||
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  ensureNotificationHandler();
  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  if (isGranted(current)) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return isGranted(requested);
}

/** Call once at app boot so Android creates the channel before any schedule. */
export async function prepareNotifications(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    ensureNotificationHandler();
    await ensureAndroidChannel();
    return await ensureNotificationPermissions();
  } catch (error) {
    console.warn('[notifications] prepare failed', error);
    return false;
  }
}

async function cancelById(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Nothing scheduled yet.
  }
}

export async function cancelNextExerciseNotification(): Promise<void> {
  if (Platform.OS === 'web') return;
  await cancelById(NEXT_EXERCISE_NOTIFICATION_ID);
}

function unlockTrigger(unlockAt: number): Notifications.NotificationTriggerInput {
  if (Platform.OS === 'android') {
    // Wall-clock DATE trigger + SCHEDULE_EXACT_ALARM (see app.json) fires when the app is closed.
    return {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: unlockAt,
      channelId: EXERCISE_REMINDER_CHANNEL_ID,
    };
  }

  const seconds = Math.max(1, Math.ceil((unlockAt - Date.now()) / 1000));
  return {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds,
    repeats: false,
    channelId: EXERCISE_REMINDER_CHANNEL_ID,
  };
}

async function presentNow(params: {
  identifier: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: params.identifier,
    content: {
      title: params.title,
      body: params.body,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: params.data,
    },
    trigger:
      Platform.OS === 'android'
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
            repeats: false,
            channelId: EXERCISE_REMINDER_CHANNEL_ID,
          }
        : null,
  });
}

/** Immediate banner when a day is finished. */
export async function presentDayCompletedNotification(params: {
  level: number;
  dayInLevel: number;
}): Promise<void> {
  if (Platform.OS === 'web') return;

  const allowed = await ensureNotificationPermissions();
  if (!allowed) return;

  const next = getNextSession(params.level, params.dayInLevel);
  const title = i18n.t('notifications.dayCompletedTitle');
  const body = next
    ? i18n.t('notifications.dayCompletedBody', {
        level: params.level,
        day: params.dayInLevel,
        nextLevel: next.level,
        nextDay: next.dayInLevel,
      })
    : i18n.t('notifications.dayCompletedFinalBody', {
        level: params.level,
        day: params.dayInLevel,
      });

  try {
    await cancelById(DAY_COMPLETED_NOTIFICATION_ID);
    await presentNow({
      identifier: DAY_COMPLETED_NOTIFICATION_ID,
      title,
      body,
      data: {
        type: 'day-completed',
        level: params.level,
        dayInLevel: params.dayInLevel,
      },
    });
  } catch (error) {
    console.warn('[notifications] day-completed present failed', error);
  }
}

/**
 * Schedule a local notification at the device-local unlock time
 * (completedAt + 12h) for the next exercise day.
 */
export async function scheduleNextExerciseNotification(params: {
  level: number;
  dayInLevel: number;
  completedAt?: number;
  /** When true, also show an immediate “day completed” notification. */
  announceCompletion?: boolean;
}): Promise<void> {
  if (Platform.OS === 'web') return;

  if (params.announceCompletion) {
    await presentDayCompletedNotification({
      level: params.level,
      dayInLevel: params.dayInLevel,
    });
  }

  const next = getNextSession(params.level, params.dayInLevel);
  if (!next) {
    await cancelNextExerciseNotification();
    return;
  }

  const completedAt = params.completedAt ?? Date.now();
  const unlockAt = completedAt + UNLOCK_DELAY_MS;

  const title = i18n.t('notifications.nextExerciseTitle');
  const body = i18n.t('notifications.nextExerciseBody', {
    level: next.level,
    day: next.dayInLevel,
  });

  const allowed = await ensureNotificationPermissions();
  if (!allowed) {
    console.warn('[notifications] permission denied — next-day reminder not scheduled');
    return;
  }

  await cancelNextExerciseNotification();

  // Unlock time already passed (OS missed the alarm or user opened late) — notify once.
  if (unlockAt <= Date.now() + 5_000) {
    const alreadyNotified = await getNotifiedUnlockAt();
    if (alreadyNotified === unlockAt) return;

    try {
      await presentNow({
        identifier: NEXT_EXERCISE_NOTIFICATION_ID,
        title,
        body,
        data: {
          type: 'next-exercise-ready',
          level: next.level,
          dayInLevel: next.dayInLevel,
          unlockAt,
        },
      });
      await setNotifiedUnlockAt(unlockAt);
    } catch (error) {
      console.warn('[notifications] missed unlock present failed', error);
    }
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: NEXT_EXERCISE_NOTIFICATION_ID,
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          type: 'next-exercise-ready',
          level: next.level,
          dayInLevel: next.dayInLevel,
          unlockAt,
        },
      },
      trigger: unlockTrigger(unlockAt),
    });
  } catch (error) {
    console.warn('[notifications] schedule next-exercise failed', error);
  }
}

/** Find the latest completed session that still has an incomplete next day. */
function findLatestCompletableSession(
  completions: Record<string, number>,
): { level: number; dayInLevel: number; completedAt: number } | null {
  const entries: { level: number; dayInLevel: number; completedAt: number }[] = [];

  for (const [key, at] of Object.entries(completions)) {
    if (typeof at !== 'number' || !Number.isFinite(at)) continue;
    const parsed = parseSessionKey(key);
    if (!parsed) continue;
    entries.push({ ...parsed, completedAt: at });
  }

  if (entries.length === 0) return null;

  entries.sort((a, b) => b.completedAt - a.completedAt);

  for (const entry of entries) {
    const next = getNextSession(entry.level, entry.dayInLevel);
    if (!next) continue;
    if (completions[sessionKey(next.level, next.dayInLevel)]) continue;
    return entry;
  }

  return null;
}

/** Re-schedule from persisted completions (app open / permission granted later). */
export async function syncNextExerciseNotification(
  completions: Record<string, number>,
  options?: { paused?: boolean },
): Promise<void> {
  if (Platform.OS === 'web') return;

  if (options?.paused) {
    await cancelNextExerciseNotification();
    return;
  }

  const latest = findLatestCompletableSession(completions);
  if (!latest) {
    await cancelNextExerciseNotification();
    return;
  }

  await scheduleNextExerciseNotification({
    level: latest.level,
    dayInLevel: latest.dayInLevel,
    completedAt: latest.completedAt,
    announceCompletion: false,
  });
}
