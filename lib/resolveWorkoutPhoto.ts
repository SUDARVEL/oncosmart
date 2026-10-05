import type { ImageSource } from "expo-image";

import { getDay1Thumbnail } from "../components/exercise/day1Thumbnails";
import type { AppAvatar, AppGender } from "../store/useAppStore";
import { isFemaleMediaTrack } from "./exerciseMediaUrls";
import { getWorkoutPhotoUrl } from "./getWorkoutPhotoUrl";
import { getWorkoutSliderPhotoUrl } from "./workoutSliderPhotoUrls";
import { getWorkoutLocalPhoto } from "./workoutLocalPhotos";
import { resolveSessionLandscapePhotoSource } from "./sessionLandscapePhotos";
import { getPhase2PlaceholderUrl, exerciseSlugFromId } from "./phase2PlaceholderMedia";
import { resolveWorkoutMediaGender } from "./workoutGrowthPlaceholders";
import workoutPhotos from "../data/workout-photos.json";

const NECK_FLEXION_FEMALE = require("../assets/workouts/neck-flexion-extension-female.jpg");
const NECK_FLEXION_MALE = require("../assets/workouts/neck-flexion-extension-male.jpg");

/**
 * Neck flexion has a portrait video and no still in storage.
 * A frame from that video fills the card and the slider.
 */
function getNeckFlexionStill(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null,
): ImageSource | null {
  const base = exerciseSlugFromId(exerciseId).replace(/-(left|right)$/i, "");
  if (base !== "neck-flexion-extension") return null;
  return isFemaleMediaTrack(gender, avatar) ? NECK_FLEXION_FEMALE : NECK_FLEXION_MALE;
}

/** Wide Head & Neck stills need cover so they fill the tall slider frame. */
export function isLandscapeWorkoutStill(
  source: ImageSource | null | undefined,
): boolean {
  if (!source || typeof source === "number") return false;
  if (Array.isArray(source)) return source.some((item) => isLandscapeWorkoutStill(item));
  if (
    typeof source === "object" &&
    "uri" in source &&
    typeof source.uri === "string"
  ) {
    return /landscape/i.test(source.uri);
  }
  return false;
}

function getPhotoFile(exerciseId: string): string | null {
  const track = workoutPhotos.male as Record<string, string | null>;
  return track[exerciseId] ?? null;
}

/**
 * Growth list circles (66×70).
 * Portrait stills from Placeholders Oncomsart Phase 2. When Head & Neck has
 * no portrait file, use the wide still or the neck-flexion frame. The circle
 * covers that image so the person fills it.
 */
export function resolveWorkoutPhotoSource(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  const phase2Url = getPhase2PlaceholderUrl(exerciseId, gender, avatar);
  if (phase2Url) return { uri: phase2Url };

  const neckFlexion = getNeckFlexionStill(exerciseId, gender, avatar);
  if (neckFlexion) return neckFlexion;

  // Head & Neck mouth and female neck stretch only exist as wide stills.
  return resolveSessionLandscapePhotoSource(exerciseId, gender, avatar);
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

  const neckFlexion = getNeckFlexionStill(exerciseId, gender, avatar);
  if (neckFlexion) return neckFlexion;

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
