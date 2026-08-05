/**
 * Expo remote push registration.
 *
 * Patient registration stays disabled — calling getExpoPushTokenAsync without
 * Android FCM / google-services can hard-crash some devices.
 *
 * Admin registration is enabled (best-effort, never throws) so pause/quit
 * alerts can reach the admin dashboard device when FCM is available.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getSupabase } from './supabase';
import { isAdminUser } from './isAdmin';

async function ensureAndroidAdminChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.setNotificationChannelAsync('admin-alerts', {
      name: 'Admin alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  } catch {
    // Channel setup is best-effort.
  }
}

async function getExpoPushTokenSafe(): Promise<string | null> {
  try {
    const Notifications = await import('expo-notifications');
    const projectId =
      Constants.easConfig?.projectId ??
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas
        ?.projectId;
    if (!projectId) return null;

    const permissions = await Notifications.getPermissionsAsync();
    let status = permissions.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') return null;

    await ensureAndroidAdminChannel();
    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResult.data?.trim() ?? '';
    return token.startsWith('ExponentPushToken') ? token : null;
  } catch (error) {
    console.warn(
      '[Push] getExpoPushTokenAsync failed',
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

export type AdminPushRegisterResult = {
  token: string | null;
  /** permission | token | saved | not_admin | error */
  status: 'saved' | 'no_permission' | 'no_token' | 'not_admin' | 'error';
};

/** Register this device for admin pause/quit alerts (admin sessions only). */
export async function registerAdminPushToken(
  userId: string,
): Promise<string | null> {
  const result = await registerAdminPushTokenDetailed(userId);
  return result.token;
}

export async function registerAdminPushTokenDetailed(
  userId: string,
): Promise<AdminPushRegisterResult> {
  const supabase = getSupabase();
  if (!supabase || !userId) return { token: null, status: 'error' };

  try {
    const { data } = await supabase.auth.getUser();
    if (!isAdminUser(data.user)) return { token: null, status: 'not_admin' };

    const Notifications = await import('expo-notifications');
    const permissions = await Notifications.getPermissionsAsync();
    let granted = permissions.granted;
    if (!granted) {
      const requested = await Notifications.requestPermissionsAsync();
      granted = requested.granted;
    }
    if (!granted) return { token: null, status: 'no_permission' };

    const token = await getExpoPushTokenSafe();
    if (!token) return { token: null, status: 'no_token' };

    const { error } = await supabase.from('admin_push_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: token,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (error) {
      console.warn('[Push] admin token upsert failed', error.message);
      return { token: null, status: 'error' };
    }
    return { token, status: 'saved' };
  } catch (error) {
    console.warn(
      '[Push] admin register threw',
      error instanceof Error ? error.message : String(error),
    );
    return { token: null, status: 'error' };
  }
}

/** Patient remote push stays off until FCM credentials ship with the APK. */
export async function registerExpoPushToken(_userId: string): Promise<string | null> {
  return null;
}

export async function requestAppUpdateBroadcast(_updateId: string): Promise<void> {
  // no-op until FCM credentials are configured for the project
}
