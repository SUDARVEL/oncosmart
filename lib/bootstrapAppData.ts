import AsyncStorage from '@react-native-async-storage/async-storage';

import { getSupabase } from './supabase';
import { useAppStore } from '../store/useAppStore';

/**
 * Bump this whenever a build must wipe stale local profile/session so users
 * land on Login instead of an old saved name/progress from a previous APK.
 */
const DATA_VERSION_KEY = 'oncosmart-data-version';
/** Bump forces a one-time local wipe so this APK starts Language → Login cleanly. */
const DATA_VERSION = '6-language-login';
const ZUSTAND_PERSIST_KEYS = ['oncofitness-app', 'oncofitness-app-v5', 'oncofitness-app-v6'];

let bootstrapPromise: Promise<void> | null = null;

async function clearLocalAppData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const toRemove = keys.filter(
    (key) =>
      ZUSTAND_PERSIST_KEYS.includes(key) ||
      key === DATA_VERSION_KEY ||
      key.startsWith('sb-') ||
      key.toLowerCase().includes('supabase'),
  );
  if (toRemove.length > 0) {
    await AsyncStorage.multiRemove(toRemove);
  }

  useAppStore.getState().resetApp();

  const supabase = getSupabase();
  if (supabase) {
    // Local-only: drop persisted Auth session on this device.
    await supabase.auth.signOut({ scope: 'local' });
  }
}

/**
 * One-time (per DATA_VERSION) wipe of local cache + Auth session.
 * Safe to call multiple times; only the first call per version does work.
 */
export function bootstrapAppData(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const current = await AsyncStorage.getItem(DATA_VERSION_KEY);
      if (current === DATA_VERSION) return;

      await clearLocalAppData();
      await AsyncStorage.setItem(DATA_VERSION_KEY, DATA_VERSION);
    })().catch((error) => {
      console.warn('[Bootstrap] Failed to reset local app data', error);
    });
  }
  return bootstrapPromise;
}
