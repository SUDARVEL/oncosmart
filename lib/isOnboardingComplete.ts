import { computeOnboardingComplete } from './userCloudSync';
import type { AppStateSnapshot } from '../store/useAppStore';

/** True when the patient finished the full onboarding + PAR-Q path. */
export function isOnboardingComplete(state: AppStateSnapshot): boolean {
  return computeOnboardingComplete(state);
}
