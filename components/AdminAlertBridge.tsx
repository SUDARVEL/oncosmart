import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  fetchAdminHoldAlerts,
  markAdminHoldAlertRead,
  presentAdminHoldLocalNotification,
  type AdminHoldAlert,
} from '../lib/adminHoldAlerts';
import { getCurrentSession, onAuthStateChange } from '../lib/auth';
import { isAdminSession } from '../lib/isAdmin';
import { registerAdminPushToken } from '../lib/pushTokens';
import { getSupabase } from '../lib/supabase';

const LAST_NOTIFIED_KEY = 'oncosmart.admin.lastNotifiedAlertAt';
const POLL_MS = 4000;

/**
 * For the signed-in admin:
 * - register Expo push token (best-effort remote)
 * - Realtime + polling for new pause/quit alerts
 * - fire an immediate local notification (works without FCM)
 */
export function AdminAlertBridge() {
  const seenIds = useRef<Set<string>>(new Set());
  const ready = useRef(false);
  const adminUserId = useRef<string | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const teardown = () => {
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const notifyAlert = async (alert: AdminHoldAlert) => {
      if (seenIds.current.has(alert.id)) return;
      seenIds.current.add(alert.id);
      await presentAdminHoldLocalNotification({
        title: alert.title || 'Patient update',
        body: alert.body || 'A patient paused or quit.',
        alertId: alert.id,
        holdType: alert.holdType,
      });
      // Mark read so catch-up / poll does not re-fire after app restart.
      void markAdminHoldAlertRead(alert.id);
      try {
        await AsyncStorage.setItem(LAST_NOTIFIED_KEY, alert.createdAt || new Date().toISOString());
      } catch {
        // ignore
      }
    };

    const pollNewAlerts = async () => {
      if (!ready.current || cancelled || !adminUserId.current) return;
      if (appStateRef.current !== 'active') return;

      const alerts = await fetchAdminHoldAlerts(15);
      if (cancelled) return;

      // Notify any unread alert we haven't seen yet (newest first → reverse for chrono notify).
      const unseen = alerts
        .filter((a) => !a.readAt && !seenIds.current.has(a.id))
        .reverse();
      for (const alert of unseen) {
        await notifyAlert(alert);
      }
    };

    const bootstrap = async (userId: string) => {
      teardown();
      ready.current = false;
      adminUserId.current = userId;
      seenIds.current = new Set();

      void registerAdminPushToken(userId);

      const existing = await fetchAdminHoldAlerts(30);
      if (cancelled) return;

      // Mark already-known alerts as seen so we only notify NEW ones going forward.
      // Exception: unread alerts from the last 15 minutes still notify once (catch-up).
      const cutoff = Date.now() - 15 * 60 * 1000;
      for (const alert of existing) {
        const createdMs = Date.parse(alert.createdAt);
        const isRecentUnread =
          !alert.readAt && Number.isFinite(createdMs) && createdMs >= cutoff;
        if (!isRecentUnread) {
          seenIds.current.add(alert.id);
        }
      }
      ready.current = true;

      // Catch-up notifications for recent unread.
      await pollNewAlerts();

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
              created_at?: string;
              read_at?: string | null;
            };
            const id = typeof row.id === 'string' ? row.id : '';
            if (!id) return;
            void notifyAlert({
              id,
              patientUserId: null,
              patientName: '',
              patientUsername: '',
              holdType: row.hold_type === 'quit' ? 'quit' : 'pause',
              reason: null,
              title: typeof row.title === 'string' ? row.title : 'Patient update',
              body:
                typeof row.body === 'string' ? row.body : 'A patient paused or quit.',
              createdAt: typeof row.created_at === 'string' ? row.created_at : '',
              readAt: row.read_at ?? null,
            });
          },
        )
        .subscribe();

      pollTimer = setInterval(() => {
        void pollNewAlerts();
      }, POLL_MS);
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
        adminUserId.current = null;
        return;
      }
      void bootstrap(session.user.id);
    });

    const appSub = AppState.addEventListener('change', (next) => {
      appStateRef.current = next;
      if (next === 'active') {
        void registerAdminPushToken(adminUserId.current ?? '');
        void pollNewAlerts();
      }
    });

    return () => {
      cancelled = true;
      teardown();
      unsubscribe();
      appSub.remove();
    };
  }, []);

  return null;
}
