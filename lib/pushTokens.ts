import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { ensureNotificationPermissions } from './nextExerciseNotification';
import { getSupabase } from './supabase';

function projectId(): string | null {
  const fromEas = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof fromEas === 'string' && fromEas.length > 0) return fromEas;
  const fromUpdates = (Constants as { easConfig?: { projectId?: string } }).easConfig
    ?.projectId;
  return typeof fromUpdates === 'string' && fromUpdates.length > 0 ? fromUpdates : null;
}

/** Register this device for Expo push and save the token on the patient row. */
export async function registerExpoPushToken(userId: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const granted = await ensureNotificationPermissions();
    if (!granted) return null;

    const pid = projectId();
    if (!pid) {
      console.warn('[Push] missing EAS projectId');
      return null;
    }

    const result = await Notifications.getExpoPushTokenAsync({ projectId: pid });
    const token = result.data?.trim();
    if (!token) return null;

    const supabase = getSupabase();
    if (!supabase) return token;

    const { error } = await supabase
      .from('patients')
      .update({
        expo_push_token: token,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.warn('[Push] save token failed', error.message);
    }
    return token;
  } catch (error) {
    console.warn('[Push] register failed', error);
    return null;
  }
}

/** Ask the cloud to push “update ready” to every registered device (once per update id). */
export async function requestAppUpdateBroadcast(updateId: string): Promise<void> {
  if (!updateId) return;
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.functions.invoke('notify-app-update', {
      body: {
        updateId,
        title: 'ONCOSMART update ready',
        body: 'A new version is ready. Open the app and pull down to refresh.',
      },
    });
    if (error) {
      console.warn('[Push] broadcast invoke failed', error.message);
    }
  } catch (error) {
    console.warn('[Push] broadcast invoke error', error);
  }
}
