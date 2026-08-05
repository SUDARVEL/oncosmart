import { useEffect, useRef } from 'react';

import {
  fetchAdminHoldAlerts,
  presentAdminHoldLocalNotification,
  type AdminHoldAlert,
} from '../lib/adminHoldAlerts';
import { getCurrentSession, onAuthStateChange } from '../lib/auth';
import { isAdminSession } from '../lib/isAdmin';
import { registerAdminPushToken } from '../lib/pushTokens';
import { getSupabase } from '../lib/supabase';

/**
 * For the signed-in admin:
 * - register Expo push token (best-effort)
 * - listen for new pause/quit alerts over Realtime
 * - show an immediate local notification (works even when remote FCM push is unavailable)
 */
export function AdminAlertBridge() {
  const seenIds = useRef<Set<string>>(new Set());
  const ready = useRef(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const teardown = () => {
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
    };

    const bootstrap = async (userId: string) => {
      teardown();
      ready.current = false;
      seenIds.current = new Set();

      // Best-effort remote token (may be null without FCM).
      void registerAdminPushToken(userId);

      const existing = await fetchAdminHoldAlerts(30);
      if (cancelled) return;
      for (const alert of existing) {
        seenIds.current.add(alert.id);
      }
      ready.current = true;

      channel = supabase
        .channel(`admin-hold-alerts:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'admin_hold_alerts',
          },
          (payload) => {
            if (!ready.current || cancelled) return;
            const row = payload.new as {
              id?: string;
              title?: string;
              body?: string;
              hold_type?: string;
            };
            const id = typeof row.id === 'string' ? row.id : '';
            if (!id || seenIds.current.has(id)) return;
            seenIds.current.add(id);

            const alert: Pick<AdminHoldAlert, 'id' | 'title' | 'body' | 'holdType'> = {
              id,
              title: typeof row.title === 'string' ? row.title : 'Patient update',
              body: typeof row.body === 'string' ? row.body : 'A patient paused or quit.',
              holdType: row.hold_type === 'quit' ? 'quit' : 'pause',
            };
            void presentAdminHoldLocalNotification({
              title: alert.title,
              body: alert.body,
              alertId: alert.id,
              holdType: alert.holdType,
            });
          },
        )
        .subscribe();
    };

    void getCurrentSession().then((session) => {
      if (cancelled || !session || !isAdminSession(session)) return;
      void bootstrap(session.user.id);
    });

    const unsubscribe = onAuthStateChange((session) => {
      if (cancelled) return;
      if (!session || !isAdminSession(session)) {
        teardown();
        ready.current = false;
        return;
      }
      void bootstrap(session.user.id);
    });

    return () => {
      cancelled = true;
      teardown();
      unsubscribe();
    };
  }, []);

  return null;
}
