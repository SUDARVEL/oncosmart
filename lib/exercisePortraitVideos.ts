/** Supabase folder for male English portrait exercise videos (CM). */
export const PORTRAIT_VIDEO_FOLDER = 'Male Potrait Videos english CM';

/**
 * Exact filenames in Supabase — single source of truth for guided sessions.
 * @see https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets/
 */
export const EXERCISE_PORTRAIT_VIDEOS: Record<string, string> = {
  'diaphragmatic-breathing': 'Male Dbe English-11.mp4',
  'ankle-pumps': 'Ankle Pumps English Male-1.mp4',
  'thoracic-expansion': 'Thoracic Expansion Exercise Male English-12.mp4',
  'arm-circles': 'Arm Circles Male English-2.mp4',
  'spot-marching': 'Spot Marching Male English-9.mp4',
  'shoulder-shrugging': 'Shoulder Shrugs Male English.mp4',
  'biceps-curls': 'Biceps Curls Male English-3.mp4',
  'wall-pushup': 'Wall Pushup Male English-15.mp4',
  'calf-raise': 'Calf Raise Male English-4.mp4',
  'sit-to-stand': 'Sit To Stand Male English-1 compressed.mp4',
  'straight-leg-raise-right': 'Slr Right Male English.mp4',
  'straight-leg-raise-left': 'Slr Left Male English.mp4',
  'knee-to-chest-right': 'Knee To Chest Male Right English-10.mp4',
  'knee-to-chest-left': 'Knee To Chest Left Male English-9.mp4',
  'static-quadriceps-right': 'Static Quadriceps Male Right Englsih-11.mp4',
  'static-quadriceps-left': 'Static Quadriceps Male Left English-10.mp4',
  'hamstring-stretch': 'Hamstring Stretch Male English-8.mp4',
  'quadriceps-stretch-right': 'Quadriceps Stretch Right Male English.mp4',
  'quadriceps-stretch-left': 'Quadriceps Stretch Left Male English.mp4',
  'calf-stretch-right': 'Calf Stretch Male Right English-6.mp4',
  'calf-stretch-left': 'Calf Stretch Male Left English-5.mp4',
  'chest-stretch': 'Chest Stretch Male Englsih-7 1 .mp4',
  'triceps-stretch-right': 'Triceps Stretch Male Right English-14.mp4',
  'triceps-stretch-left': 'Triceps Stretch Male Left English-13.mp4',
  'neck-stretch-right': 'Neck Stretch Male Right English.mp4',
  'neck-stretch-left': 'Neck Stretch Male Left English-12.mp4',
};

export function getPortraitVideoFilename(exerciseId: string): string | null {
  return EXERCISE_PORTRAIT_VIDEOS[exerciseId] ?? null;
}

export function getPortraitVideoPath(exerciseId: string): string | null {
  const filename = getPortraitVideoFilename(exerciseId);
  if (!filename) return null;
  return `${PORTRAIT_VIDEO_FOLDER}/${filename}`;
}
