import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppLanguage } from '../store/useAppStore';

/** Device-level language choice (survives logout / resetApp). */
const PREFERRED_LANGUAGE_KEY = 'oncosmart-preferred-language';

export async function getPreferredLanguage(): Promise<AppLanguage | null> {
  try {
    const value = await AsyncStorage.getItem(PREFERRED_LANGUAGE_KEY);
    if (value === 'en' || value === 'ta') return value;
    return null;
  } catch {
    return null;
  }
}

export async function setPreferredLanguage(language: AppLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFERRED_LANGUAGE_KEY, language);
  } catch (error) {
    console.warn('[Language] Failed to persist preferred language', error);
  }
}
