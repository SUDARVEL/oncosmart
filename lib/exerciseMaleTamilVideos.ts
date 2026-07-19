/**
 * Male Tamil portrait / guided-session videos in Supabase bucket
 * `Oncosmart Videos and Assets`.
 * Folder matches the uploaded zip extract path exactly.
 */

export const MALE_TAMIL_PORTRAIT_FOLDER =
  'Male Tamil Compressed-20260719T095050Z-1-001/Male Tamil Compressed';

/**
 * Exact Tamil portrait filenames (all levels after Start Session).
 * Filenames must match storage exactly.
 */
export const MALE_TAMIL_PORTRAIT_VIDEO_FILES: Record<string, string> = {
  'diaphragmatic-breathing': 'Dbe Male Tamil.mp4',
  'ankle-pumps': 'Ankle Pumps Tamil Male.mp4',
  'thoracic-expansion': 'Tee Male Tamil.mp4',
  'arm-circles': 'Arm Circles Male Tamil.mp4',
  'spot-marching': 'Spot Marching Male Tamil.mp4',
  'shoulder-shrugging': 'Shoulder Shrugs Male Tamil.mp4',
  'biceps-curls': 'Biceps Curls Male Tamil.mp4',
  'wall-pushup': 'Wall Pushup Male Tamil.mp4',
  'calf-raise': 'Calf Raise Male Tamil.mp4',
  'sit-to-stand': 'Sit To Stand Male Tamil.mp4',
  'straight-leg-raise-right': 'Slr Male Right Tamil.mp4',
  'straight-leg-raise-left': 'Slr Male Left Tamil.mp4',
  'knee-to-chest-right': 'Knee To Chest Male Right Tamil.mp4',
  'knee-to-chest-left': 'Knee To Chest Male Left Tamil.mp4',
  'static-quadriceps-right': 'Static Quadriceps Male Right Tamil.mp4',
  'static-quadriceps-left': 'Static Quadriceps Male Left Tamil.mp4',
  'hamstring-stretch': 'Hamstring Stretch Male Tamil.mp4',
  'quadriceps-stretch-right': 'Quadriceps Stretch Right Male Tamil.mp4',
  'quadriceps-stretch-left': 'Quadriceps Stretch Left Male Tamil.mp4',
  'calf-stretch-right': 'Calf Stretch Male Right Tamil.mp4',
  'calf-stretch-left': 'Calf Stretch Male Left Tamil.mp4',
  'chest-stretch': 'Chest Stretch Male Tamil1.mp4',
  'triceps-stretch-right': 'Triceps Stretch Male Right Tamil.mp4',
  'triceps-stretch-left': 'Triceps Stretch Male Left Tamil.mp4',
  'neck-stretch-right': 'Neck Stretch Male Right Tamil.mp4',
  'neck-stretch-left': 'Neck Stretch Male Left Tamil.mp4',
};

export function getMaleTamilPortraitVideoPath(exerciseId: string): string | null {
  const file = MALE_TAMIL_PORTRAIT_VIDEO_FILES[exerciseId];
  if (!file) return null;
  return `${MALE_TAMIL_PORTRAIT_FOLDER}/${file}`;
}
