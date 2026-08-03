import type { Session } from '@supabase/supabase-js';

import { getSupabase } from './supabase';

/** Test accounts are username-based; Supabase Auth is email-based, so we map them. */
const ACCOUNT_EMAIL_DOMAIN = 'oncosmart.app';

function usernameToEmail(usernameOrEmail: string): string {
  const value = usernameOrEmail.trim().toLowerCase();
  if (!value) return value;
  return value.includes('@') ? value : `${value}@${ACCOUNT_EMAIL_DOMAIN}`;
}

export type SignInResult = { ok: true } | { ok: false; message: string };

/** Sign in with a username (e.g. "test01") or full email + password. */
export async function signInWithUsername(
  usernameOrEmail: string,
  password: string,
): Promise<SignInResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: 'Login is not available right now.' };
  }

  const email = usernameToEmail(usernameOrEmail);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

/** Subscribe to auth changes; returns an unsubscribe function. */
export function onAuthStateChange(cb: (session: Session | null) => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}

export type ChangePasswordResult = { ok: true } | { ok: false; message: string };

/**
 * Change password for the currently signed-in user.
 * Re-authenticates with the current password, then updates to the new one.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, message: 'Password change is not available right now.' };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    return { ok: false, message: 'You must be signed in to change your password.' };
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthError) {
    return { ok: false, message: 'Current password is incorrect.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    return { ok: false, message: updateError.message };
  }
  return { ok: true };
}
