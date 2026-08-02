import type { Session, User } from '@supabase/supabase-js';

/** True when the Auth user has app_metadata.role = 'admin'. */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const role = (user.app_metadata as { role?: unknown } | undefined)?.role;
  return role === 'admin';
}

export function isAdminSession(session: Session | null | undefined): boolean {
  return isAdminUser(session?.user);
}
