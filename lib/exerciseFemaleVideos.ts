/**
 * Female exercise videos in Supabase bucket `Oncosmart Videos and Assets`.
 * Folders match the uploaded zip extract paths exactly.
 */

export const FEMALE_LANDSCAPE_FOLDER =
  'Female Landscape-20260712T164630Z-2-001/Female Landscape';

export const FEMALE_PORTRAIT_FOLDER =
  'Female English Compressed-20260712T164558Z-2-001/Female English Compressed';

export const FEMALE_TAMIL_PORTRAIT_FOLDER =
  'Female Tamil Compressed-20260719T095054Z-1-001/Female Tamil Compressed';

/**
 * Exact landscape loop filenames (session cards).
 * Keep storage typos exactly (Excercise, Landsacpe, Chai squat).
 */
export const FEMALE_LANDSCAPE_VIDEO_FILES: Partial<Record<string, string>> = {
  'diaphragmatic-breathing': 'Diaphragmatic Breathing Female Landscape.mp4',
  'ankle-pumps': 'Ankle pumps female landscape.mp4',
  'thoracic-expansion': 'Thoracic Expansion Excercise Female Landscape.mp4',
  'arm-circles': 'Arm circle Female Landscape.mp4',
  'spot-marching': 'Spot Marching Female Landscape.mp4',
  'shoulder-shrugging': 'Shoulder shrug Female Landscape.mp4',
  'biceps-curls': 'Biceps curls Female Landscape.mp4',
  'wall-pushup': 'Wall pushup Female Landscape.mp4',
  'calf-raise': 'Calf raises Female Landscape.mp4',
  // Storage filename uses "Chai" (chair squat) for sit-to-stand.
  'sit-to-stand': 'Chai squat Female Landsacpe.mp4',
  'straight-leg-raise-left': 'SLR Left Female Landscape.mp4',
  'straight-leg-raise-right': 'SLR Right Female Landscape.mp4',
  'knee-to-chest-left': 'Knee to chest Left Female Landscape.mp4',
  'knee-to-chest-right': 'Knee to chest Right Female Landscape.mp4',
  'static-quadriceps-left': 'Static Quadriceps Left Female Landscape.mp4',
  'static-quadriceps-right': 'Static Quadriceps Right Female Landscape.mp4',
};

/**
 * Exact English portrait / guided-session filenames (all levels after Start Session).
 * Filenames must match storage exactly (including typos like Englsih / English2).
 */
export const FEMALE_PORTRAIT_VIDEO_FILES: Partial<Record<string, string>> = {
  'diaphragmatic-breathing': 'Female Dbe English.mp4',
  'ankle-pumps': 'Ankle Pumps English Female.mp4',
  'thoracic-expansion': 'Tee Female English.mp4',
  'arm-circles': 'Arm Circles Female English.mp4',
  'spot-marching': 'Spot Marching Female English.mp4',
  'shoulder-shrugging': 'Shoulders Shrugs Female English.mp4',
  'biceps-curls': 'Biceps Curls Female English.mp4',
  'wall-pushup': 'Wall Pushup Female English.mp4',
  'calf-raise': 'Calf Raise Female English.mp4',
  'sit-to-stand': 'Sit To Stand Female English.mp4',
  'straight-leg-raise-left': 'Slr Female Left English.mp4',
  'straight-leg-raise-right': 'Slr Female Right English.mp4',
  'knee-to-chest-right': 'Knee To Chest Right Female English.mp4',
  'knee-to-chest-left': 'Knee To Chest Left Female English.mp4',
  'static-quadriceps-right': 'Static Quadriceps Female Right English.mp4',
  'static-quadriceps-left': 'Static Quadriceps Female Left English.mp4',
  'hamstring-stretch': 'Hamstring Stretch Female English.mp4',
  'quadriceps-stretch-right': 'Quadriceps Stretch Right Female English.mp4',
  'quadriceps-stretch-left': 'Quadriceps Stretch Left Female English.mp4',
  'calf-stretch-right': 'Calf Stretch Female Right English.mp4',
  'calf-stretch-left': 'Calf Stretch Female Left English.mp4',
  'chest-stretch': 'Chest Stretch Female English2.mp4',
  'triceps-stretch-right': 'Triceps Stretch Female Right English.mp4',
  'triceps-stretch-left': 'Triceps Stretch Female Left Englsih.mp4',
  'neck-stretch-right': 'Neck Stretch Female Right English.mp4',
  'neck-stretch-left': 'Neck Stretch Female Left English.mp4',
};

/**
 * Exact Tamil portrait / guided-session filenames.
 * Filenames must match storage exactly (including typo Shurgs).
 */
export const FEMALE_TAMIL_PORTRAIT_VIDEO_FILES: Partial<Record<string, string>> = {
  'diaphragmatic-breathing': 'Dbe Female Tamil.mp4',
  'ankle-pumps': 'Ankle Pumps Tamil Female.mp4',
  'thoracic-expansion': 'Tee Female Tamil.mp4',
  'arm-circles': 'Arm Circles Female Tamil.mp4',
  'spot-marching': 'Spot Marching Female Tamil.mp4',
  'shoulder-shrugging': 'Shoulder Shurgs Female Tamil.mp4',
  'biceps-curls': 'Biceps Curls Female Tamil.mp4',
  'wall-pushup': 'Wall Pushup Female Tamil.mp4',
  'calf-raise': 'Calf Raise Female Tamil.mp4',
  'sit-to-stand': 'Sit To Stand Female Tamil.mp4',
  'straight-leg-raise-left': 'Slr Female Left Tamil.mp4',
  'straight-leg-raise-right': 'Slr Female Right Tamil.mp4',
  'knee-to-chest-right': 'Knee To Chest Female Right Tamil.mp4',
  'knee-to-chest-left': 'Knee To Chest Female Left Tamil.mp4',
  'static-quadriceps-right': 'Static Quadriceps Female Right Tamil.mp4',
  'static-quadriceps-left': 'Static Quadriceps Female Left Tamil.mp4',
  'hamstring-stretch': 'Hamstring Stretch Female Tamil.mp4',
  'quadriceps-stretch-right': 'Quadriceps Stretch Right Female Tamil.mp4',
  'quadriceps-stretch-left': 'Quadriceps Stretch Left Female Tamil.mp4',
  'calf-stretch-right': 'Calf Stretch Female Right Tamil.mp4',
  'calf-stretch-left': 'Calf Stretch Female Left Tamil.mp4',
  // Guided chest stretch Tamil uses the dual-panel English female asset (product source).
  'chest-stretch': 'Chest Stretch Female English2.mp4',
  'triceps-stretch-right': 'Triceps Stretch Female Right Tamil.mp4',
  'triceps-stretch-left': 'Triceps Stretch Female Left Tamil.mp4',
  'neck-stretch-right': 'Neck Stretch Female Right Tamil.mp4',
  'neck-stretch-left': 'Neck Stretch Female Left Tamil.mp4',
};

export function getFemaleLandscapeVideoPath(exerciseId: string): string | null {
  const file = FEMALE_LANDSCAPE_VIDEO_FILES[exerciseId];
  if (!file) return null;
  return `${FEMALE_LANDSCAPE_FOLDER}/${file}`;
}

export function getFemalePortraitVideoPath(exerciseId: string): string | null {
  const file = FEMALE_PORTRAIT_VIDEO_FILES[exerciseId];
  if (!file) return null;
  return `${FEMALE_PORTRAIT_FOLDER}/${file}`;
}

export function getFemaleTamilPortraitVideoPath(exerciseId: string): string | null {
  const file = FEMALE_TAMIL_PORTRAIT_VIDEO_FILES[exerciseId];
  if (!file) return null;
  // Chest stretch Tamil intentionally uses the Female English dual-panel file.
  if (exerciseId === 'chest-stretch') {
    return `${FEMALE_PORTRAIT_FOLDER}/${file}`;
  }
  return `${FEMALE_TAMIL_PORTRAIT_FOLDER}/${file}`;
}
