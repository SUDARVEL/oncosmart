import {
  normalizeCancerTypeSlug,
  type CancerTypeSlug,
} from './cancerPathway';
import { clearLevelExercisesCache } from './getDayExercises';
import { warmPathwaySessionsFromStore } from './getDay1Session';
import {
  cancelNextExerciseNotification,
  syncNextExerciseNotification,
} from './nextExerciseNotification';
import { clearPathwayVideoCache } from './pathwayVideoIndex';
import { saveCloudProfileFromStore } from './userCloudSync';
import { useAppStore } from '../store/useAppStore';

/** Apply a new cancer pathway slug and rebuild video session caches. */
export async function applyCancerTypeChange(nextSlug: CancerTypeSlug): Promise<void> {
  const state = useAppStore.getState();
  const current = normalizeCancerTypeSlug(state.cancerType);
  if (current === nextSlug) return;

  state.resetExerciseProgress();
  state.setCancerType(nextSlug);

  clearLevelExercisesCache();
  clearPathwayVideoCache();
  await warmPathwaySessionsFromStore();
  clearLevelExercisesCache();

  const userId = useAppStore.getState().activeAuthUserId;
  if (userId) {
    await saveCloudProfileFromStore(userId);
  }

  await cancelNextExerciseNotification();
  void syncNextExerciseNotification(useAppStore.getState().dayCompletedAt);
}
