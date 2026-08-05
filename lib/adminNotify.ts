import {
  buildHoldAlertCopy,
  createAdminHoldAlert,
} from './adminHoldAlerts';
import type { HoldReason, ProgressHoldType } from './progressHold';
import { getSupabase } from './supabase';

/**
 * Notify admins that a patient paused or quit.
 * 1) Always write an `admin_hold_alerts` row (admin dashboard + realtime).
 * 2) Best-effort Expo remote push via edge function (needs a registered admin token).
 */
export async function notifyAdminsOfHold(params: {
  holdType: ProgressHoldType;
  reason: HoldReason | null;
  patientName: string;
  patientUsername?: string;
}): Promise<void> {
  const alertId = await createAdminHoldAlert(params);

  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) return;

    const copy = buildHoldAlertCopy(params);
    const { data, error } = await supabase.functions.invoke('notify-admin-hold', {
      body: {
        holdType: params.holdType,
        reason: params.reason,
        patientName: params.patientName,
        patientUsername: params.patientUsername ?? params.patientName,
        title: copy.title,
        body: copy.body,
        alertId,
      },
    });
    if (error) {
      console.warn('[AdminNotify] hold notify failed', error.message);
      return;
    }
    console.log('[AdminNotify] hold notify result', data);
  } catch (error) {
    console.warn(
      '[AdminNotify] hold notify threw',
      error instanceof Error ? error.message : String(error),
    );
  }
}
