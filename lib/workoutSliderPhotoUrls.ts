import type { AppGender } from "../store/useAppStore";

const SUPABASE_PUBLIC_BASE =
  "https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets";

const MALE_SLIDER_PHOTOS_PREFIX = "Male Slider Photos";
const FEMALE_SLIDER_PHOTOS_PREFIX = "Female slider";

/** Figma / Supabase male slider images — filenames must match storage exactly. */
const MALE_SLIDER_PHOTO_FILES: Record<string, string> = {
  "diaphragmatic-breathing": "Diaphgrametic Breathing Slider.png",
  "ankle-pumps": "Ankle Pump Slider.png",
  "thoracic-expansion": "Thoracic Expansion Slider.png",
  "arm-circles": "Arm Circles Slider.png",
  "spot-marching": "Spot Marching slider.png",
  "shoulder-shrugging": "Shoulder Shrugging Slider.png",
  "biceps-curls": "Bicep Curls Slider.png",
  "wall-pushup": "Wall pushup Slider.png",
  "calf-raise": "Calf Rises Slider.png",
  "sit-to-stand": "Sit to stand slider.png",
  "straight-leg-raise-right": "straight leg raise slider.png",
  "straight-leg-raise-left": "straight leg raise left slider.png",
  "knee-to-chest-right": "Knee to chest right.png",
  "knee-to-chest-left": "Knee to chest left.png",
  "static-quadriceps-right": "Static quadricepts left.png",
  "static-quadriceps-left": "Static quadricepts left.png",
  "hamstring-stretch": "hamstring stretch.png",
  "quadriceps-stretch-right": "quadricep right stretch.png",
  "quadriceps-stretch-left": "Quadricep left stretch.png",
  "calf-stretch-right": "Calf strectch right slider.png",
  "calf-stretch-left": "Calf stretch left slider.png",
  "chest-stretch": "Pectorals Stretch Slider.png",
  "triceps-stretch-right": "Tricep Stretch Slider Right.png",
  "triceps-stretch-left": "Tricep Stretch Slider Left.png",
  "neck-stretch-right": "Neck Stretch ( right ).png",
  "neck-stretch-left": "Neck Stretch Left.png",
};

/**
 * Exact filenames in Female slider folder (verified HTTP 200).
 * Keep storage typos/spacing exactly (Diaphrgamatic, Englsih, double spaces).
 * Exercises without a file fall back to Growth placeholders.
 */
const FEMALE_SLIDER_PHOTO_FILES: Partial<Record<string, string>> = {
  "diaphragmatic-breathing": "Diaphrgamatic breathing.png",
  "ankle-pumps": "Ankle pumps English Female 1.png",
  "thoracic-expansion": "Thoracic expansion exercise Female English 1.png",
  "arm-circles": "Arm circles Female English 1.png",
  "spot-marching": "Spot marching female.png",
  "shoulder-shrugging": "Shoulders shrugging Female English 1.png",
  "biceps-curls": "Biceps curls Female English 4.png",
  "wall-pushup": "Wall Pushup Female English 1.png",
  "calf-raise": "Calf raise English 1.png",
  "sit-to-stand": "Sit to stand Female English 1.png",
  "straight-leg-raise-left": "SLR left English 1.png",
  "straight-leg-raise-right": "SLR Right English 1.png",
  "knee-to-chest-left": "Knee to chest Left.png",
  // Double space before "Right" is intentional.
  "knee-to-chest-right": "Knee to chest  Right.png",
  "static-quadriceps-right": "Static Quadriceps Right Englsih 1.png",
  "quadriceps-stretch-left": "Quadriceps Stretch Left FeMale English 1.png",
  "quadriceps-stretch-right": "Quadriceps Stretch Right FeMale English 1.png",
  "calf-stretch-left": "Calf stretch Female Left English 1.png",
  "calf-stretch-right": "Calf stretch Female Right English 1.png",
  "chest-stretch": "Chest stretch Female English2 1.png",
  "triceps-stretch-left": "Triceps stretch Female LEft Englsih 2.png",
  "triceps-stretch-right": "Triceps stretch Female Right English 2.png",
  "neck-stretch-left": "Neck stretch Female Left English 1.png",
  "neck-stretch-right": "Neck stretch Female Right English 1.png",
};

const sliderPhotoUrlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildSliderUrl(folder: string, photoFile: string): string {
  const objectPath = `${folder}/${photoFile}`;
  return `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}`;
}

/**
 * Public URL for the workout detail slider image.
 * Male → Male Slider Photos; female → Female slider.
 */
export function getWorkoutSliderPhotoUrl(
  exerciseId: string,
  gender: AppGender | null,
): string | null {
  const isFemale = gender === "female";
  const photoFile = isFemale
    ? FEMALE_SLIDER_PHOTO_FILES[exerciseId]
    : MALE_SLIDER_PHOTO_FILES[exerciseId];
  if (!photoFile) return null;

  const folder = isFemale
    ? FEMALE_SLIDER_PHOTOS_PREFIX
    : MALE_SLIDER_PHOTOS_PREFIX;
  const cacheKey = `${isFemale ? "f" : "m"}|${exerciseId}|${photoFile}`;
  const cached = sliderPhotoUrlCache.get(cacheKey);
  if (cached) return cached;

  const url = buildSliderUrl(folder, photoFile);
  sliderPhotoUrlCache.set(cacheKey, url);
  return url;
}
