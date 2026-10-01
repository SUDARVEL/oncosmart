import type { ImageSource } from "expo-image";

import { getDay1Thumbnail } from "../components/exercise/day1Thumbnails";
import type { AppAvatar, AppGender } from "../store/useAppStore";
import { getWorkoutPhotoUrl } from "./getWorkoutPhotoUrl";
import { getWorkoutSliderPhotoUrl } from "./workoutSliderPhotoUrls";
import { getWorkoutLocalPhoto } from "./workoutLocalPhotos";
import { resolveSessionLandscapePhotoSource } from "./sessionLandscapePhotos";
import { getPhase2PlaceholderUrl, exerciseSlugFromId } from "./phase2PlaceholderMedia";
import { getFemaleNeckStretchSliderPhoto } from "./femaleNeckStretchSliderPhotos";
import {
  getWorkoutGrowthPlaceholderUrl,
  resolveWorkoutMediaGender,
} from "./workoutGrowthPlaceholders";
import workoutPhotos from "../data/workout-photos.json";

function getPhotoFile(exerciseId: string): string | null {
  const track = workoutPhotos.male as Record<string, string | null>;
  return track[exerciseId] ?? null;
}

/**
 * Growth list circles (66×70).
 * Prefer Phase 2 portrait placeholders, then legacy SVGs / slider / landscape.
 */
export function resolveWorkoutPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  const phase2Url = getPhase2PlaceholderUrl(exerciseId, gender, avatar);
  if (phase2Url) return { uri: phase2Url };

  const placeholderUrl = getWorkoutGrowthPlaceholderUrl(
    exerciseId,
    gender,
    avatar,
  );
  if (placeholderUrl) return { uri: placeholderUrl };

  const mediaGender = resolveWorkoutMediaGender(gender, avatar);
  const sliderUrl = getWorkoutSliderPhotoUrl(
    exerciseId,
    mediaGender === "female" ? "female" : gender,
  );
  if (sliderUrl) return { uri: sliderUrl };

  const landscape = resolveSessionLandscapePhotoSource(
    exerciseId,
    mediaGender === "female" ? "female" : gender,
    avatar,
  );
  if (landscape) return landscape;

  const photoFile = getPhotoFile(exerciseId);
  const remoteUrl = getWorkoutPhotoUrl(photoFile, mediaGender);
  if (remoteUrl) return { uri: remoteUrl };

  // Avoid showing male bundled art when the user is on a female avatar.
  if (mediaGender === "female") return null;

  const day1Photo = getDay1Thumbnail(exerciseId);
  if (day1Photo) return day1Photo;

  return getWorkoutLocalPhoto(exerciseId);
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

  const femaleNeck = getFemaleNeckStretchSliderPhoto(exerciseId, gender, avatar);
  if (femaleNeck) return femaleNeck;

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
