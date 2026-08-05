/**
 * Background admin pause/quit alert checker.
 *
 * While an admin stays logged in, Android WorkManager / iOS BGTaskScheduler
 * periodically wake the app (even when closed) to fetch unread hold alerts and
 * show a local notification. Minimum interval is ~15 minutes (OS-controlled).
 *
 * Instant closed-app delivery still needs remote Expo push + FCM; this is the
 * reliable fallback that works with the current APK capabilities once rebuilt.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

import {
  fetchAdminHoldAlerts,
  markAdminHoldAlertRead,
  presentAdminHoldLocalNotification,
} from './adminHoldAlerts';
import { getCurrentSession } from './auth';
import { isAdminSession } from './isAdmin';
import { registerAdminPushToken } from './pushTokens';

export const ADMIN_HOLD_ALERT_BACKGROUND_TASK = 'oncosmart-admin-hold-alerts';

const SEEN_KEY = 'oncosmart.admin.backgroundSeenAlertIds';
const MAX_SEEN = 80;

async function loadSeenIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

async function saveSeenIds(ids: Set<string>): Promise<void> {
  const list = Array.from(ids).slice(-MAX_SEEN);
  try {
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

async function runAdminHoldAlertBackgroundCheck(): Promise<void> {
  if (Platform.OS === 'web') return;

  const session = await getCurrentSession();
  if (!session || !isAdminSession(session)) {
    await unregisterAdminHoldAlertBackgroundTask();
    return;
  }

  void registerAdminPushToken(session.user.id);

  const seen = await loadSeenIds();
  const alerts = await fetchAdminHoldAlerts(20);
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  const unseen = alerts
    .filter((alert) => {
      if (alert.readAt) return false;
      if (seen.has(alert.id)) return false;
      const createdMs = Date.parse(alert.createdAt);
      if (Number.isFinite(createdMs) && createdMs < cutoff) return false;
      return true;
    })
    .reverse();

  for (const alert of unseen) {
    seen.add(alert.id);
    await presentAdminHoldLocalNotification({
      title: alert.title || 'Patient update',
      body: alert.body || 'A patient paused or quit.',
      alertId: alert.id,
      holdType: alert.holdType,
    });
    void markAdminHoldAlertRead(alert.id);
  }

  await saveSeenIds(seen);
}

if (!TaskManager.isTaskDefined(ADMIN_HOLD_ALERT_BACKGROUND_TASK)) {
  TaskManager.defineTask(ADMIN_HOLD_ALERT_BACKGROUND_TASK, async () => {
    try {
      await runAdminHoldAlertBackgroundCheck();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch (error) {
      console.warn(
        '[AdminAlerts] background task failed',
        error instanceof Error ? error.message : String(error),
      );
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

export async function registerAdminHoldAlertBackgroundTask(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
      console.warn('[AdminAlerts] background tasks unavailable on this device');
      return;
    }
    const already = await TaskManager.isTaskRegisteredAsync(ADMIN_HOLD_ALERT_BACKGROUND_TASK);
    if (already) return;
    await BackgroundTask.registerTaskAsync(ADMIN_HOLD_ALERT_BACKGROUND_TASK, {
      // OS minimum is 15 minutes; treat as the floor for closed-app catch-up.
      minimumInterval: 15,
    });
    console.log('[AdminAlerts] background alert task registered');
  } catch (error) {
    console.warn(
      '[AdminAlerts] background register failed',
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function unregisterAdminHoldAlertBackgroundTask(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const already = await TaskManager.isTaskRegisteredAsync(ADMIN_HOLD_ALERT_BACKGROUND_TASK);
    if (!already) return;
    await BackgroundTask.unregisterTaskAsync(ADMIN_HOLD_ALERT_BACKGROUND_TASK);
  } catch {
    // ignore
  }
}
