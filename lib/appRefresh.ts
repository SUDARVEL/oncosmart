import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

import i18n from '../i18n';
import { useAppStore } from '../store/useAppStore';
import {
  ensureNotificationPermissions,
  syncNextExerciseNotification,
} from './nextExerciseNotification';
import { loadCloudProfileIntoStore } from './userCloudSync';

/** Local notification when a new EAS Update is downloaded and waiting. */
export const APP_UPDATE_NOTIFICATION_ID = 'app-update-ready';
export const APP_UPDATE_CHANNEL_ID = 'app-updates';

const LAST_NOTIFIED_UPDATE_KEY = 'oncosmart.lastNotifiedUpdateId';
const PENDING_UPDATE_KEY = 'oncosmart.pendingUpdateId';
const RELOAD_LOCK_KEY = 'oncosmart.updateReloadLock';

export type UpdateRefreshStatus =
  | 'disabled'
  | 'up_to_date'
  | 'downloaded'
  | 'reloading'
  | 'error';

export type AppRefreshResult = {
  cloudOk: boolean;
  updateStatus: UpdateRefreshStatus;
};

let reloadInFlight = false;

function updatesSupported(): boolean {
  if (Platform.OS === 'web') return false;
  if (__DEV__) return false;
  return Updates.isEnabled === true;
}

async function ensureUpdateChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(APP_UPDATE_CHANNEL_ID, {
    name: 'App updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 180],
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

function updateIdentity(manifest: Updates.Manifest | undefined | null): string | null {
  if (!manifest || typeof manifest !== 'object') return null;
  const id = (manifest as { id?: unknown }).id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

async function shouldNotifyForUpdate(updateId: string | null): Promise<boolean> {
  if (!updateId) return true;
  try {
    const previous = await AsyncStorage.getItem(LAST_NOTIFIED_UPDATE_KEY);
    return previous !== updateId;
  } catch {
    return true;
  }
}

async function markUpdateNotified(updateId: string | null): Promise<void> {
  if (!updateId) return;
  try {
    await AsyncStorage.setItem(LAST_NOTIFIED_UPDATE_KEY, updateId);
  } catch {
    // ignore
  }
}

async function markUpdatePending(updateId: string | null): Promise<void> {
  try {
    await AsyncStorage.setItem(PENDING_UPDATE_KEY, updateId ?? 'pending');
  } catch {
    // ignore
  }
}

async function consumePendingUpdate(): Promise<boolean> {
  try {
    const pending = await AsyncStorage.getItem(PENDING_UPDATE_KEY);
    if (!pending) return false;
    await AsyncStorage.removeItem(PENDING_UPDATE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Notify once per published update id that a refresh will install it. */
export async function notifyAppUpdateReady(updateId: string | null): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!(await shouldNotifyForUpdate(updateId))) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  await ensureUpdateChannel();

  try {
    await Notifications.cancelScheduledNotificationAsync(APP_UPDATE_NOTIFICATION_ID);
  } catch {
    // nothing scheduled
  }

  await Notifications.scheduleNotificationAsync({
    identifier: APP_UPDATE_NOTIFICATION_ID,
    content: {
      title: i18n.t('notifications.appUpdateTitle'),
      body: i18n.t('notifications.appUpdateBody'),
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: APP_UPDATE_CHANNEL_ID } : {}),
      data: { type: 'app_update', updateId: updateId ?? '' },
    },
    trigger: null,
  });

  await markUpdateNotified(updateId);
}

/** Pull latest patient profile / progress from Supabase into the local store. */
export async function refreshCloudData(): Promise<boolean> {
  const userId = useAppStore.getState().activeAuthUserId;
  if (!userId) return false;

  try {
    const result = await loadCloudProfileIntoStore(userId);
    if (!result.ok) return false;
    const state = useAppStore.getState();
    await syncNextExerciseNotification(state.dayCompletedAt, {
      paused: state.progressPaused,
    });
    return true;
  } catch (error) {
    console.warn('[AppRefresh] cloud refresh failed', error);
    return false;
  }
}

async function reloadDownloadedUpdate(): Promise<UpdateRefreshStatus> {
  if (reloadInFlight) return 'reloading';
  reloadInFlight = true;
  try {
    // Soft lock so a double pull doesn't race reloads.
    await AsyncStorage.setItem(RELOAD_LOCK_KEY, String(Date.now()));
    await Updates.reloadAsync();
    return 'reloading';
  } catch (error) {
    reloadInFlight = false;
    console.warn('[AppRefresh] reload failed', error);
    try {
      await AsyncStorage.removeItem(RELOAD_LOCK_KEY);
    } catch {
      // ignore
    }
    return 'error';
  }
}

/**
 * Check EAS Update for a new bundle.
 * - notifyIfReady: local + push broadcast (once per update id)
 * - reloadIfReady: apply immediately (used by pull-to-refresh)
 */
export async function checkFetchAppUpdate(options?: {
  reloadIfReady?: boolean;
  notifyIfReady?: boolean;
}): Promise<UpdateRefreshStatus> {
  if (!updatesSupported()) return 'disabled';

  try {
    const check = await Updates.checkForUpdateAsync();

    if (check.isAvailable) {
      const fetched = await Updates.fetchUpdateAsync();
      if (!fetched.isNew) {
        if (options?.reloadIfReady) {
          await consumePendingUpdate();
          return reloadDownloadedUpdate();
        }
        return 'up_to_date';
      }

      const updateId =
        updateIdentity(fetched.manifest) ??
        updateIdentity(check.manifest) ??
        Updates.updateId ??
        null;

      await markUpdatePending(updateId);

      if (options?.notifyIfReady) {
        await notifyAppUpdateReady(updateId);
      }

      if (options?.reloadIfReady) {
        await consumePendingUpdate();
        return reloadDownloadedUpdate();
      }

      return 'downloaded';
    }

    // No newer server update — but a previously downloaded bundle may be waiting.
    if (options?.reloadIfReady && (await consumePendingUpdate())) {
      return reloadDownloadedUpdate();
    }

    return 'up_to_date';
  } catch (error) {
    console.warn('[AppRefresh] update check failed', error);
    return 'error';
  }
}

/**
 * Pull-to-refresh action used on Home / Growth / Settings:
 * 1) refresh cloud progress
 * 2) download + apply any pending EAS Update so the new build appears immediately
 */
export async function runPullToRefresh(): Promise<AppRefreshResult> {
  let cloudOk = false;
  try {
    cloudOk = await refreshCloudData();
  } catch (error) {
    console.warn('[AppRefresh] cloud refresh threw', error);
  }

  let updateStatus: UpdateRefreshStatus = 'disabled';
  try {
    updateStatus = await checkFetchAppUpdate({
      reloadIfReady: true,
      notifyIfReady: false,
    });
  } catch (error) {
    console.warn('[AppRefresh] update apply threw', error);
    updateStatus = 'error';
  }

  return { cloudOk, updateStatus };
}

/**
 * Foreground check: download any pending EAS Update, notify once, then
 * reload the app automatically so users don't keep pull-to-refreshing.
 */
export async function checkForUpdateInBackground(): Promise<UpdateRefreshStatus> {
  return checkFetchAppUpdate({
    reloadIfReady: true,
    notifyIfReady: true,
  });
}
