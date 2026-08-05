import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { checkForUpdateInBackground } from '../lib/appRefresh';

const FOREGROUND_CHECK_DELAY_MS = 800;
const STARTUP_CHECK_DELAY_MS = 1200;

/**
 * Checks for EAS Updates when the app opens / returns to foreground.
 * Downloads the bundle, posts a local notification, and reloads automatically.
 */
export function AppUpdateBridge() {
  const checkingRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    let cancelled = false;

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

    const startupTimer = setTimeout(() => {
      void runCheck();
    }, STARTUP_CHECK_DELAY_MS);

    const sub = AppState.addEventListener('change', (next) => {
      const wasBackground =
        appStateRef.current === 'background' || appStateRef.current === 'inactive';
      appStateRef.current = next;
      if (wasBackground && next === 'active') {
        setTimeout(() => {
          void runCheck();
        }, FOREGROUND_CHECK_DELAY_MS);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(startupTimer);
      sub.remove();
    };
  }, []);

  return null;
}
