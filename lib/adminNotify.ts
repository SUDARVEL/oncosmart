import { buildHoldAlertCopy } from './adminHoldAlerts';
import type { HoldReason, ProgressHoldType } from './progressHold';
import { getSupabase } from './supabase';

/**
 * Notify admins that a patient paused or quit.
 *
 * Alert rows are created by the `patients_emit_hold_alert` DB trigger when
 * `saveCloudProfileFromStore` writes pause/quit fields. This function only
 * best-effort sends Expo remote push (needs a registered admin token).
 *
 * The signed-in admin app also polls/realtime `admin_hold_alerts` and shows
 * a local notification even when remote push tokens are missing.
 */
export async function notifyAdminsOfHold(params: {
  holdType: ProgressHoldType;
  reason: HoldReason | null;
  patientName: string;
  patientUsername?: string;
}): Promise<void> {
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
        // Alert already created by patients trigger after cloud save.
        alertId: 'trigger',
      },
    });
    if (error) {
      console.warn('[AdminNotify] edge push failed (alert still saved)', error.message);
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
