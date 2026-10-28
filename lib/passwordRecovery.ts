import { getSupabase } from './supabase';

export type RecoveryError =
  | 'invalid_email'
  | 'invalid_username'
  | 'no_email'
  | 'unknown_user'
  | 'rate_limit'
  | 'bad_code'
  | 'expired'
  | 'weak_password'
  | 'unauthorized'
  | 'mail_failed'
  | 'unavailable';

export type RecoveryResult = { ok: true } | { ok: false; error: RecoveryError };

type Action = 'bind_send' | 'bind_confirm' | 'reset_send' | 'reset_confirm';

async function callRecovery(
  action: Action,
  body: Record<string, string>,
): Promise<RecoveryResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'unavailable' };

  const { data, error } = await supabase.functions.invoke('password-recovery', {
    body: { action, ...body },
  });
  if (error) {
    const context = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context;
    if (context?.json) {
      try {
        const payload = await context.json();
        if (payload?.error) return { ok: false, error: payload.error as RecoveryError };
      } catch {
        // Fall through to the generic failure.
      }
    }
    return { ok: false, error: 'mail_failed' };
  }
  const payload = data as { ok?: boolean; error?: RecoveryError } | null;
  if (payload?.ok) return { ok: true };
  return { ok: false, error: payload?.error ?? 'mail_failed' };
}

export function sendRecoveryBindCode(email: string, language: string) {
  return callRecovery('bind_send', { email, language });
}

export function confirmRecoveryBind(email: string, code: string) {
  return callRecovery('bind_confirm', { email, code });
}

export function sendPasswordResetCode(username: string, language: string) {
  return callRecovery('reset_send', { username, language });
}

export function confirmPasswordReset(username: string, code: string, password: string) {
  return callRecovery('reset_confirm', { username, code, password });
}

export async function loadRecoveryEmail(): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;
  const { data } = await supabase
    .from('patients')
    .select('recovery_email')
    .eq('user_id', userId)
    .maybeSingle();
  const email = (data?.recovery_email as string | null) ?? '';
  return email.trim() || null;
}
