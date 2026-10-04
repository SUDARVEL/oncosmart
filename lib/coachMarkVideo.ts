import type { AppLanguage } from '../store/useAppStore';
import { getPublicStorageUrl } from './supabaseStorage';

/**
 * Walkthrough uploaded in Supabase `Coach mark video`.
 * One recording covers the tour. English and Tamil both play it;
 * the player chrome follows the selected language.
 */
const WALKTHROUGH_BY_LANGUAGE: Record<AppLanguage, string> = {
  en: 'Coach mark video/WhatsApp Video 2026-10-04 at 11.36.22 AM.mp4',
  ta: 'Coach mark video/WhatsApp Video 2026-10-04 at 11.36.22 AM.mp4',
};

const LOGO_PATH = 'App Logo/ONCOSMART logo with name 1024x1024.png';

export function getCoachMarkVideoUrl(language: AppLanguage | null): string | null {
  const path = WALKTHROUGH_BY_LANGUAGE[language === 'ta' ? 'ta' : 'en'];
  return getPublicStorageUrl(path);
}

export function getCoachMarkLogoUrl(): string | null {
  return getPublicStorageUrl(LOGO_PATH);
}
