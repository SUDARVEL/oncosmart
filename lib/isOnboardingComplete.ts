import type { AppStateSnapshot } from '../store/useAppStore';

/** True when the patient finished the full onboarding + PAR-Q path. */
export function isOnboardingComplete(state: AppStateSnapshot): boolean {
  return Boolean(
    state.language &&
      state.username.trim() &&
      state.gender &&
      state.avatar &&
      (state.age != null || state.ageRange) &&
      state.parqCleared !== null,
  );
}
