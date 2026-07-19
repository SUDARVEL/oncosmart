import type { AppAvatar, AppGender } from "../store/useAppStore";
import type { GrowthPlaceholderFitConfig } from "./fitGrowthPlaceholderSvg";

const SUPABASE_PUBLIC_BASE =
  "https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets";

const MALE_PLACEHOLDER_FOLDER = "Male Workouts placeholder";
const FEMALE_PLACEHOLDER_FOLDER = "Female placeholder";

/**
 * Exact filenames in Male Workouts placeholder (66×70 circular SVGs).
 * Filenames must match storage exactly (including casing / missing spaces).
 */
const MALE_WORKOUT_PLACEHOLDER_FILES: Partial<Record<string, string>> = {
  "diaphragmatic-breathing": "Diaphragmatic Breathing.svg",
  "ankle-pumps": "Ankle Pumps.svg",
  "arm-circles": "arm circles.svg",
  "thoracic-expansion": "thoracic expansion.svg",
  "sit-to-stand": "sit to stand.svg",
  "straight-leg-raise-left": "slr left.svg",
  "straight-leg-raise-right": "slr right.svg",
  "knee-to-chest-left": "knee to chest left.svg",
  "knee-to-chest-right": "knee to chest right.svg",
  "static-quadriceps-left": "static quadriceps left.svg",
  "static-quadriceps-right": "static quadriceps right.svg",
  "hamstring-stretch": "hamstring stretch.svg",
  "chest-stretch": "Chest stretch.svg",
  "quadriceps-stretch-left": "quadriceps stretch left.svg",
  "quadriceps-stretch-right": "quadriceps stretch right.svg",
  "calf-stretch-left": "calf stretch left.svg",
  "calf-stretch-right": "calf stretch right.svg",
  "triceps-stretch-right": "triceps stretch right.svg",
  "triceps-stretch-left": "triceps stretchleft.svg",
  "neck-stretch-left": "neck stretch left.svg",
  "neck-stretch-right": "neck stretch right.svg",
};

/**
 * Exact filenames in Female placeholder folder (verified HTTP 200).
 * Keep storage typos/spacing exactly (Diaphrgamatic, Englsih, Landsacpe, double spaces).
 */
const FEMALE_WORKOUT_PLACEHOLDER_FILES: Partial<Record<string, string>> = {
  "diaphragmatic-breathing": "Diaphrgamatic breathing.svg",
  "ankle-pumps": "Ankle pumps English Female 1.svg",
  "thoracic-expansion": "Thoracic expansion exercise Female English 1.svg",
  "arm-circles": "Arm circles Female English 1.svg",
  "spot-marching": "Spot marching female.svg",
  "shoulder-shrugging": "Shoulders shrugging Female English 1.svg",
  "biceps-curls": "Biceps curls Female English 4.svg",
  "wall-pushup": "Wall pushup.svg",
  "calf-raise": "Calf raises Female Landscape 2.svg",
  "sit-to-stand": "Sit to stand Female English 1.svg",
  "straight-leg-raise-left": "SLR left English 1.svg",
  "straight-leg-raise-right": "SLR Right English 1.svg",
  "knee-to-chest-left": "Knee to chest Left.svg",
  // Double space before "Right" is intentional.
  "knee-to-chest-right": "Knee to chest  Right.svg",
  "static-quadriceps-left": "Static Quadriceps left Englsih 1.svg",
  "static-quadriceps-right": "Static Quadriceps Right Englsih 1.svg",
  "hamstring-stretch": "FemaleHamstring stretch Landscape 2.svg",
  "quadriceps-stretch-left": "Quadriceps Stretch Female Left 2.svg",
  "quadriceps-stretch-right": "Quadriceps Stretch Female Right 2.svg",
  "calf-stretch-left": "Calf stretch Female Left Landscape 2.svg",
  "calf-stretch-right": "Calf stretch Female Right Landscape 2.svg",
  // Double space before "Female" is intentional.
  "chest-stretch": "Chest Stretch Back  Female 1 3.svg",
  "triceps-stretch-left": "Triceps Stretch Left Female Landsacpe 2.svg",
  "triceps-stretch-right": "Triceps Stretch Right Female Landsacpe 2.svg",
  "neck-stretch-left": "Neck stretch Left Female Landscape 2.svg",
  "neck-stretch-right": "Neck stretch Right Female Landscape 2.svg",
};

/**
 * Per-exercise crop: keep the pose readable in the circle without clipping the body.
 * fill 0 = full photo (small), 1 = cover (fills the circle, may clip edges).
 */
const MALE_WORKOUT_PLACEHOLDER_FIT: Partial<
  Record<string, GrowthPlaceholderFitConfig>
> = {
  "thoracic-expansion": { fill: 0.9, offsetY: -0.05 },
  "sit-to-stand": { fill: 0.9, offsetY: -0.05 },
  "straight-leg-raise-left": { fill: 0.32, offsetY: -0.08 },
  "straight-leg-raise-right": { fill: 0.32, offsetY: -0.08 },
};

/**
 * Female landscape SVGs are room-scale photos, not pre-cropped like male 66×70 assets.
 * Zoom past cover and shift up so the figure fills the circle (no empty band above/below).
 */
const FEMALE_COVER_FIT: GrowthPlaceholderFitConfig = { fill: 1.5, offsetY: -0.14 };

const FEMALE_WORKOUT_PLACEHOLDER_FIT: Partial<
  Record<string, GrowthPlaceholderFitConfig>
> = {
  "diaphragmatic-breathing": { fill: 1.55, offsetY: -0.12 },
  "ankle-pumps": { fill: 1.5, offsetY: -0.12 },
  "thoracic-expansion": { fill: 1.55, offsetY: -0.14 },
  "arm-circles": { fill: 1.5, offsetY: -0.13 },
  "spot-marching": { fill: 1.5, offsetY: -0.13 },
  "shoulder-shrugging": { fill: 1.5, offsetY: -0.13 },
  "biceps-curls": { fill: 1.5, offsetY: -0.13 },
  "wall-pushup": { fill: 1.45, offsetY: -0.1 },
  "calf-raise": { fill: 1.45, offsetY: -0.12 },
  "sit-to-stand": { fill: 1.5, offsetY: -0.14 },
  "straight-leg-raise-left": { fill: 1.2, offsetY: -0.08 },
  "straight-leg-raise-right": { fill: 1.2, offsetY: -0.08 },
  "knee-to-chest-left": { fill: 1.3, offsetY: -0.1 },
  "knee-to-chest-right": { fill: 1.3, offsetY: -0.1 },
  "static-quadriceps-left": { fill: 1.4, offsetY: -0.1 },
  "static-quadriceps-right": { fill: 1.4, offsetY: -0.1 },
  "hamstring-stretch": { fill: 1.35, offsetY: -0.1 },
  "quadriceps-stretch-left": { fill: 1.4, offsetY: -0.1 },
  "quadriceps-stretch-right": { fill: 1.4, offsetY: -0.1 },
  "calf-stretch-left": { fill: 1.4, offsetY: -0.1 },
  "calf-stretch-right": { fill: 1.4, offsetY: -0.1 },
  "chest-stretch": { fill: 1.45, offsetY: -0.1 },
  "triceps-stretch-left": { fill: 1.4, offsetY: -0.1 },
  "triceps-stretch-right": { fill: 1.4, offsetY: -0.1 },
  "neck-stretch-left": { fill: 1.45, offsetY: -0.1 },
  "neck-stretch-right": { fill: 1.45, offsetY: -0.1 },
};

/** Prefer avatar for media gender so Growth matches the selected character. */
export function resolveWorkoutMediaGender(
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): "male" | "female" {
  if (avatar === "female" || gender === "female") return "female";
  return "male";
}

export function getWorkoutGrowthPlaceholderFit(
  exerciseId: string,
  mediaGender: "male" | "female" = "male",
): GrowthPlaceholderFitConfig | null {
  if (mediaGender === "female") {
    // Always rewrite female SVGs — native files leave letterbox gaps in the 66×70 circle.
    return FEMALE_WORKOUT_PLACEHOLDER_FIT[exerciseId] ?? FEMALE_COVER_FIT;
  }
  return MALE_WORKOUT_PLACEHOLDER_FIT[exerciseId] ?? null;
}

const urlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function getWorkoutGrowthPlaceholderUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  const mediaGender = resolveWorkoutMediaGender(gender, avatar);
  const file =
    mediaGender === "female"
      ? FEMALE_WORKOUT_PLACEHOLDER_FILES[exerciseId]
      : MALE_WORKOUT_PLACEHOLDER_FILES[exerciseId];
  if (!file) return null;

  const folder =
    mediaGender === "female"
      ? FEMALE_PLACEHOLDER_FOLDER
      : MALE_PLACEHOLDER_FOLDER;
  const cacheKey = `${mediaGender}|${exerciseId}|${file}`;
  const cached = urlCache.get(cacheKey);
  if (cached) return cached;

  const url = `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(`${folder}/${file}`)}`;
  urlCache.set(cacheKey, url);
  return url;
}
