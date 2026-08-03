import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { checkForUpdateInBackground } from '../lib/appRefresh';

const FOREGROUND_CHECK_DELAY_MS = 2500;
const STARTUP_CHECK_DELAY_MS = 6000;

/**
 * Quietly checks for EAS Updates when the app opens / returns to foreground.
 * Downloads the bundle and posts a local notification so the patient can
 * pull-to-refresh inside the app to apply it.
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
