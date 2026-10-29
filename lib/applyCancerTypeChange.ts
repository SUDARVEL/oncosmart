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
export async function applyCancerTypeChange(nextSlug: CancerTypeSlug): Promise<boolean> {
  const state = useAppStore.getState();
  const current = normalizeCancerTypeSlug(state.cancerType);
  if (current === nextSlug) return true;

  state.resetExerciseProgress();
  state.setCancerType(nextSlug);

  clearLevelExercisesCache();
  clearPathwayVideoCache();
  await warmPathwaySessionsFromStore();
  clearLevelExercisesCache();

  const userId = useAppStore.getState().activeAuthUserId;
  const saved = userId ? await saveCloudProfileFromStore(userId) : true;

  await cancelNextExerciseNotification();
  void syncNextExerciseNotification(useAppStore.getState().dayCompletedAt);
  return saved;
}
