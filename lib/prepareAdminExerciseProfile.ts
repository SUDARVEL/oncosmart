import type { Session } from '@supabase/supabase-js';

import { computeOnboardingComplete, loadCloudProfileIntoStore, saveCloudProfileFromStore } from './userCloudSync';
import { useAppStore } from '../store/useAppStore';

/**
 * Ensure an admin account can use the patient exercise UI for demos/testing.
 * Loads any existing cloud profile; if onboarding is incomplete, seeds a
 * ready-to-exercise demo profile and marks onboarding complete.
 */
export async function prepareAdminExerciseProfile(
  session: Session,
  keptLanguage?: 'en' | 'ta' | null,
): Promise<void> {
  const userId = session.user.id;
  useAppStore.getState().setActiveAuthUserId(userId);

  await loadCloudProfileIntoStore(userId);

  const state = useAppStore.getState();
  if (keptLanguage) {
    state.setLanguage(keptLanguage);
  }

  const email = session.user.email ?? '';
  const fallbackName = email.includes('@') ? email.split('@')[0]! : 'Admin';
  const displayName =
    state.username.trim() ||
    (typeof fallbackName === 'string' && fallbackName.trim() ? fallbackName.trim() : 'Admin');

  if (!state.username.trim()) {
    state.setUsername(displayName.startsWith('Admin') ? displayName : `Admin (${displayName})`);
  }
  if (!state.gender) state.setGender('prefer_not_to_say');
  if (!state.avatar) state.setAvatar('male');
  if (state.age == null && !state.ageRange) state.setAge(35);
  if (!state.cancerType.trim()) state.setCancerType('demo');
  if (state.treatmentUndergoing == null) state.setTreatmentUndergoing('none');
  if (state.underwentSurgery == null) state.setUnderwentSurgery(false);
  if (state.parqCleared == null) {
    for (let i = 0; i < 7; i += 1) {
      state.setParqAnswer(i, false);
    }
    state.setParqCleared(true);
  }

  state.setCloudProfileReady(true);
  state.setCoachTourSeen(true);

  const next = useAppStore.getState();
  if (!computeOnboardingComplete(next)) {
    // Force the few fields computeOnboardingComplete cares about.
    if (!next.language) next.setLanguage(keptLanguage ?? 'en');
    if (!next.username.trim()) next.setUsername('Admin');
    if (!next.gender) next.setGender('prefer_not_to_say');
    if (!next.avatar) next.setAvatar('male');
    if (next.age == null && !next.ageRange) next.setAge(35);
    if (next.parqCleared == null) next.setParqCleared(true);
  }

  await saveCloudProfileFromStore(userId);
}
