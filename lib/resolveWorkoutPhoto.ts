import type { ImageSource } from "expo-image";

import { getDay1Thumbnail } from "../components/exercise/day1Thumbnails";
import type { AppAvatar, AppGender } from "../store/useAppStore";
import { getWorkoutPhotoUrl } from "./getWorkoutPhotoUrl";
import { getWorkoutSliderPhotoUrl } from "./workoutSliderPhotoUrls";
import { getWorkoutLocalPhoto } from "./workoutLocalPhotos";
import { resolveSessionLandscapePhotoSource } from "./sessionLandscapePhotos";
import { getPhase2PlaceholderUrl, exerciseSlugFromId } from "./phase2PlaceholderMedia";
import { resolveWorkoutMediaGender } from "./workoutGrowthPlaceholders";
import workoutPhotos from "../data/workout-photos.json";

function getPhotoFile(exerciseId: string): string | null {
  const track = workoutPhotos.male as Record<string, string | null>;
  return track[exerciseId] ?? null;
}

/**
 * Growth list circles (66×70).
 * Only portrait stills from Placeholders Oncomsart Phase 2. Landscape and
 * legacy slider files are a different ratio and stay off these circles.
 */
export function resolveWorkoutPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  const phase2Url = getPhase2PlaceholderUrl(exerciseId, gender, avatar);
  return phase2Url ? { uri: phase2Url } : null;
}

/**
 * Workout info slider (349×444).
 * Prefer Phase 2 portrait placeholders. Never fall back to Growth list circle SVGs
 * or to male bundled art when the selected character is female.
 */
export function resolveWorkoutSliderPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  const phase2Url = getPhase2PlaceholderUrl(exerciseId, gender, avatar);
  if (phase2Url) return { uri: phase2Url };

  const mediaGender = resolveWorkoutMediaGender(gender, avatar);
  const sliderGender: AppGender | null =
    mediaGender === "female" ? "female" : gender;

  // Same-gender Phase II landscape before legacy slider files. Several legacy
  // female slider objects 400, and a pathway id used to miss both lookups.
  const landscape = resolveSessionLandscapePhotoSource(
    exerciseId,
    sliderGender,
    avatar,
  );
  if (landscape) return landscape;

  const sliderUrl = getWorkoutSliderPhotoUrl(exerciseId, sliderGender);
  if (sliderUrl) return { uri: sliderUrl };

  const slug = exerciseSlugFromId(exerciseId);
  const photoFile = getPhotoFile(slug);
  const remoteUrl = getWorkoutPhotoUrl(photoFile, mediaGender);
  if (remoteUrl) return { uri: remoteUrl };

  if (mediaGender === "female") return null;

  const day1Photo = getDay1Thumbnail(slug);
  if (day1Photo) return day1Photo;

  return getWorkoutLocalPhoto(slug);
}
