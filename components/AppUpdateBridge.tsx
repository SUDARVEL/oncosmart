import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { checkForUpdateInBackground } from '../lib/appRefresh';

const FOREGROUND_CHECK_DELAY_MS = 400;
const STARTUP_CHECK_DELAY_MS = 600;
const RETRY_DELAYS_MS = [2500, 8000];

/**
 * Checks for EAS Updates when the app opens / returns to foreground.
 * Downloads the bundle, posts a local notification, and reloads automatically.
 */
export function AppUpdateBridge() {
  const checkingRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const retryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let cancelled = false;

    const clearRetryTimers = () => {
      for (const timer of retryTimersRef.current) {
        clearTimeout(timer);
      }
      retryTimersRef.current = [];
    };

    const runCheck = async () => {
      if (cancelled || checkingRef.current) return;
      checkingRef.current = true;
      try {
        await checkForUpdateInBackground();
      } catch (error) {
        console.warn('[AppUpdateBridge] check failed', error);
      } finally {
        checkingRef.current = false;
      }
    };

    const scheduleRetries = () => {
      clearRetryTimers();
      for (const delay of RETRY_DELAYS_MS) {
        const timer = setTimeout(() => {
          void runCheck();
        }, delay);
        retryTimersRef.current.push(timer);
      }
    };

    const startupTimer = setTimeout(() => {
      void runCheck();
      scheduleRetries();
    }, STARTUP_CHECK_DELAY_MS);

    const sub = AppState.addEventListener('change', (next) => {
      const wasBackground =
        appStateRef.current === 'background' || appStateRef.current === 'inactive';
      appStateRef.current = next;
      if (wasBackground && next === 'active') {
        setTimeout(() => {
          void runCheck();
          scheduleRetries();
        }, FOREGROUND_CHECK_DELAY_MS);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(startupTimer);
      clearRetryTimers();
      sub.remove();
    };
  }, []);

  return null;
}
