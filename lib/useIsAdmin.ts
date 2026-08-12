import { useEffect, useState } from 'react';

import { getCurrentSession, onAuthStateChange } from '../lib/auth';
import { isAdminSession } from '../lib/isAdmin';

/** Live admin-role flag for the signed-in session (false until session resolves). */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getCurrentSession().then((session) => {
      if (!cancelled) setIsAdmin(isAdminSession(session));
    });
    const unsubscribe = onAuthStateChange((session) => {
      if (!cancelled) setIsAdmin(isAdminSession(session));
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return isAdmin;
}
