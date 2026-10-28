import { getSupabase } from './supabase';
import { ensurePatientRow } from './userCloudSync';

export type PhoneAuthResult =
  | { ok: true; userId?: string }
  | { ok: false; message: string; code?: string };

/** Indian mobile numbers become +91XXXXXXXXXX. */
export function toE164India(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

export function formatIndiaPhone(e164: string): string {
  const local = e164.replace(/^\+91/, '');
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

/**
 * Text a 6-digit code.
 * First-time login may create the account. Forgot-password only texts a number already registered.
 */
export async function sendPhoneOtp(
  phone: string,
  options?: { createUser?: boolean },
): Promise<PhoneAuthResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: 'Login is not available right now.' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms',
      shouldCreateUser: options?.createUser !== false,
    },
  });
  if (error) {
    return { ok: false, message: error.message, code: error.code };
  }
  return { ok: true };
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<PhoneAuthResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: 'Login is not available right now.' };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) {
    return { ok: false, message: error.message, code: error.code };
  }
  return { ok: true, userId: data.user?.id };
}

/** Remember the verified mobile number on this patient's row. */
export async function savePatientPhone(userId: string, phone: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const patientId = await ensurePatientRow(userId);
  if (!patientId) return;
  const { error } = await supabase.from('patients').update({ phone }).eq('id', patientId);
  if (error) {
    console.warn('[PhoneAuth] phone save failed', error.message);
  }
}

/** Map a Supabase auth error onto a translation key. */
export function phoneAuthErrorKey(message: string, code?: string): string {
  const blob = `${code ?? ''} ${message}`.toLowerCase();
  if (
    blob.includes('phone_provider_disabled') ||
    blob.includes('unsupported phone provider') ||
    (blob.includes('sms') && blob.includes('provider'))
  ) {
    return 'phoneLogin.providerOff';
  }
  if (
    blob.includes('signups not allowed') ||
    blob.includes('user not found') ||
    blob.includes('otp_disabled')
  ) {
    return 'phoneLogin.notFound';
  }
  if (blob.includes('expired')) return 'phoneLogin.expired';
  if (blob.includes('rate') || blob.includes('once every') || blob.includes('too many')) {
    return 'phoneLogin.rateLimit';
  }
  if (blob.includes('invalid') || blob.includes('token') || blob.includes('otp')) {
    return 'phoneLogin.wrongCode';
  }
  return 'phoneLogin.generic';
}
