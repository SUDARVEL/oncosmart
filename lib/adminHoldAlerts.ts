import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { HoldReason, ProgressHoldType } from './progressHold';
import { getSupabase } from './supabase';

export type AdminHoldAlert = {
  id: string;
  patientUserId: string | null;
  patientName: string;
  patientUsername: string;
  holdType: ProgressHoldType;
  reason: string | null;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

const ADMIN_ALERTS_CHANNEL_ID = 'admin-alerts';

function reasonLabel(reason: string | null | undefined): string {
  switch (reason) {
    case 'tired':
      return 'Feeling tired';
    case 'pain':
      return 'Having pain';
    case 'treatment':
      return 'Recently underwent treatment';
    case 'unwell':
      return 'Not feeling well';
    case 'exploring':
      return 'Just exploring';
    default:
      return typeof reason === 'string' && reason.trim() ? reason.trim() : 'No reason given';
  }
}

export function buildHoldAlertCopy(params: {
  holdType: ProgressHoldType;
  reason: HoldReason | string | null;
  patientName: string;
  patientUsername?: string;
}): { title: string; body: string } {
  const username = (params.patientUsername || params.patientName || 'patient').trim();
  const name = (params.patientName || username).trim();
  const actionWord = params.holdType === 'quit' ? 'quit' : 'paused';
  const title =
    params.holdType === 'quit' ? 'Patient quit exercise' : 'Patient paused exercise';
  const body = `${name} (${username}) has ${actionWord}. Reason: ${reasonLabel(params.reason)}.`;
  return { title, body };
}

async function ensureAdminAlertChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ADMIN_ALERTS_CHANNEL_ID, {
    name: 'Admin alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

/** Show an immediate local notification on this device (works without FCM). */
export async function presentAdminHoldLocalNotification(params: {
  title: string;
  body: string;
  alertId?: string;
  holdType?: ProgressHoldType;
}): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    await ensureAdminAlertChannel();
    const permissions = await Notifications.getPermissionsAsync();
    if (!permissions.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        sound: true,
        ...(Platform.OS === 'android' ? { channelId: ADMIN_ALERTS_CHANNEL_ID } : {}),
        data: {
          type: 'patient_hold',
          alertId: params.alertId ?? '',
          holdType: params.holdType ?? '',
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.warn(
      '[AdminAlerts] local notify failed',
      error instanceof Error ? error.message : String(error),
    );
  }
}

/** Patient-side: persist an alert row so admin always sees pause/quit. */
export async function createAdminHoldAlert(params: {
  holdType: ProgressHoldType;
  reason: HoldReason | null;
  patientName: string;
  patientUsername?: string;
}): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const username = (params.patientUsername || params.patientName || 'patient').trim();
  const name = (params.patientName || username).trim();
  const { title, body } = buildHoldAlertCopy({
    holdType: params.holdType,
    reason: params.reason,
    patientName: name,
    patientUsername: username,
  });

  const { data, error } = await supabase
    .from('admin_hold_alerts')
    .insert({
      patient_user_id: userId,
      patient_name: name,
      patient_username: username,
      hold_type: params.holdType,
      reason: params.reason,
      title,
      body,
    })
    .select('id')
    .single();

  if (error) {
    console.warn('[AdminAlerts] insert failed', error.message);
    return null;
  }
  return (data?.id as string) ?? null;
}

export async function fetchAdminHoldAlerts(limit = 20): Promise<AdminHoldAlert[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('admin_hold_alerts')
    .select(
      'id,patient_user_id,patient_name,patient_username,hold_type,reason,title,body,created_at,read_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[AdminAlerts] fetch failed', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    patientUserId: (row.patient_user_id as string | null) ?? null,
    patientName: (row.patient_name as string) || '',
    patientUsername: (row.patient_username as string) || '',
    holdType: row.hold_type === 'quit' ? 'quit' : 'pause',
    reason: (row.reason as string | null) ?? null,
    title: (row.title as string) || '',
    body: (row.body as string) || '',
    createdAt: (row.created_at as string) || '',
    readAt: (row.read_at as string | null) ?? null,
  }));
}

export async function markAdminHoldAlertRead(alertId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !alertId) return;
  const { error } = await supabase
    .from('admin_hold_alerts')
    .update({ read_at: new Date().toISOString() })
    .eq('id', alertId)
    .is('read_at', null);
  if (error) {
    console.warn('[AdminAlerts] mark read failed', error.message);
  }
}
