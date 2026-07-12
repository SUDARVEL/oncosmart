/**
 * Female exercise videos in Supabase bucket `Oncosmart Videos and Assets`.
 * Folders match the uploaded zip extract paths exactly.
 */

export const FEMALE_LANDSCAPE_FOLDER =
  'Female Landscape-20260712T164630Z-2-001/Female Landscape';

export const FEMALE_PORTRAIT_FOLDER =
  'Female English Compressed-20260712T164558Z-2-001/Female English Compressed';

/**
 * Verified landscape loop filenames (session cards).
 * Only include files confirmed present in storage — missing IDs fall back to photos.
 */
export const FEMALE_LANDSCAPE_VIDEO_FILES: Partial<Record<string, string>> = {
  'diaphragmatic-breathing': 'Diaphragmatic Breathing Female Landscape.mp4',
  'thoracic-expansion': 'Thoracic Expansion Excercise Female Landscape.mp4',
  'spot-marching': 'Spot Marching Female Landscape.mp4',
  'straight-leg-raise-left': 'SLR Left Female Landscape.mp4',
  'straight-leg-raise-right': 'SLR Right Female Landscape.mp4',
  'static-quadriceps-right': 'Static Quadriceps Right Female Landscape.mp4',
  'static-quadriceps-left': 'Static Quadriceps Left Female Landscape.mp4',
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
