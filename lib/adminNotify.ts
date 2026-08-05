import { getSupabase } from './supabase';
import type { ProgressHoldType } from './progressHold';
import type { PauseReason } from '../store/useAppStore';

/** Ask the edge function to push an alert to registered admin devices. */
export async function notifyAdminsOfHold(params: {
  holdType: ProgressHoldType;
  reason: PauseReason | null;
  patientName: string;
  patientUsername?: string;
}): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) return;

    const { error } = await supabase.functions.invoke('notify-admin-hold', {
      body: {
        holdType: params.holdType,
        reason: params.reason,
        patientName: params.patientName,
        patientUsername: params.patientUsername ?? params.patientName,
      },
    });
    if (error) {
      console.warn('[AdminNotify] hold notify failed', error.message);
    }
  } catch (error) {
    console.warn(
      '[AdminNotify] hold notify threw',
      error instanceof Error ? error.message : String(error),
    );
  }
}
