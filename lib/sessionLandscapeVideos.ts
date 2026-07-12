import type { AppAvatar, AppGender } from '../store/useAppStore';
import { getSessionLandscapeVideoUrl as resolveLandscape } from './exerciseMediaUrls';

/** @deprecated Prefer importing from exerciseMediaUrls — kept for existing imports. */
export function getSessionLandscapeVideoUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  return resolveLandscape(exerciseId, gender, avatar);
}
