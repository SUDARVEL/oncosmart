/**
 * Map pathway filename labels → stable exercise slugs + clean UI copy.
 * Falls back to a cleaned filename title when unknown.
 */

import { getClinicalExerciseDescription } from './clinicalExerciseDescriptions';

export type PathwayExerciseCopy = {
  slug: string;
  title: string;
  description: string;
};

type SlugRule = { pattern: RegExp; slug: string };

const SLUG_RULES: SlugRule[] = [
  { pattern: /\bdbe\b|diaphragmatic|breathing exercise/i, slug: 'diaphragmatic-breathing' },
  { pattern: /ankle pump/i, slug: 'ankle-pumps' },
  { pattern: /\btee\b|thoracic expansion/i, slug: 'thoracic-expansion' },
  { pattern: /arm circle/i, slug: 'arm-circles' },
  { pattern: /arm rotation/i, slug: 'arm-rotation' },
  { pattern: /spot march/i, slug: 'spot-marching' },
  { pattern: /shoulder shrug/i, slug: 'shoulder-shrugging' },
  { pattern: /biceps curl/i, slug: 'biceps-curls' },
  { pattern: /wall push/i, slug: 'wall-pushup' },
  { pattern: /wall slide/i, slug: 'wall-slides' },
  { pattern: /wall climb/i, slug: 'wall-climbing' },
  { pattern: /calf raise/i, slug: 'calf-raise' },
  { pattern: /calf stretch/i, slug: 'calf-stretch' },
  { pattern: /hamstring curl/i, slug: 'standing-hamstring-curls' },
  { pattern: /hamstring/i, slug: 'hamstring-stretch' },
  { pattern: /knee extension|seated knee/i, slug: 'seated-knee-extension' },
  { pattern: /\bslr\b|straight leg/i, slug: 'straight-leg-raise' },
  { pattern: /quadriceps stretch/i, slug: 'quadriceps-stretch' },
  { pattern: /triceps stretch/i, slug: 'triceps-stretch' },
  { pattern: /chest stretch|pectoralis/i, slug: 'chest-stretch' },
  {
    pattern: /neck flexion|flexion\s*(and|&|ad)?\s*extension/i,
    slug: 'neck-flexion-extension',
  },
  { pattern: /mouth opening|jaw opening/i, slug: 'jaw-opening-closing' },
  { pattern: /jaw side|side[\s-]*to[\s-]*side/i, slug: 'jaw-side-to-side' },
  { pattern: /neck stretch/i, slug: 'neck-stretch' },
];

const TITLES: Record<string, string> = {
  'diaphragmatic-breathing': 'Diaphragmatic Breathing',
  'ankle-pumps': 'Ankle Pumps',
  'thoracic-expansion': 'Thoracic Expansion',
  'arm-circles': 'Arm Circles',
  'arm-rotation': 'Arm Rotation',
  'spot-marching': 'Spot Marching',
  'shoulder-shrugging': 'Shoulder Shrugs',
  'biceps-curls': 'Biceps Curls',
  'wall-pushup': 'Wall Push-up',
  'wall-slides': 'Wall Slides',
  'wall-climbing': 'Wall Climbing',
  'calf-raise': 'Calf Raise',
  'calf-stretch': 'Calf Stretch',
  'standing-hamstring-curls': 'Hamstring Curls',
  'hamstring-stretch': 'Hamstring Stretch',
  'seated-knee-extension': 'Knee Extension',
  'straight-leg-raise': 'Straight Leg Raise',
  'quadriceps-stretch': 'Quadriceps Stretch',
  'triceps-stretch': 'Triceps Stretch',
  'chest-stretch': 'Chest Stretch',
  'neck-flexion-extension': 'Neck Flexion & Extension',
  'jaw-opening-closing': 'Mouth Opening',
  'jaw-side-to-side': 'Jaw Side to Side',
  'neck-stretch': 'Neck Stretch',
};

const DESCRIPTIONS: Record<string, string> = {
  'diaphragmatic-breathing':
    'Helps improve lung expansion and oxygen supply. Breathe in through your nose and out through your mouth with relaxed shoulders.',
  'ankle-pumps':
    'Improves blood circulation and reduces stiffness in the legs. Pump your ankles up and down in a steady rhythm.',
  'thoracic-expansion':
    'Improves chest expansion and ventilation. Place your hands on the sides of your chest and breathe deeply.',
  'arm-circles':
    'Improves shoulder mobility and circulation. Make slow, controlled circles with your arms.',
  'arm-rotation': 'Gently mobilises the shoulders and upper back. Move within a comfortable range.',
  'spot-marching':
    'Light marching in place to warm up and improve circulation. Keep a steady, comfortable pace.',
  'shoulder-shrugging':
    'Releases tension in the neck and shoulders. Lift both shoulders toward your ears, then relax.',
  'biceps-curls':
    'Maintains arm strength with a controlled curling motion. Keep your elbows close to your body.',
  'wall-pushup':
    'Builds upper-body strength using the wall for support. Keep your body straight and move slowly.',
  'wall-slides':
    'Improves shoulder mobility along the wall. Slide your arms up and down without forcing the stretch.',
  'wall-climbing':
    'Shoulder mobility exercise mimicking climbing on the wall. Walk your fingers upward within comfort.',
  'calf-raise':
    'Strengthens calf muscles and ankle stability. Rise onto your toes, pause, then lower with control.',
  'calf-stretch':
    'Stretches the calf muscles to improve flexibility. Hold a gentle stretch without bouncing.',
  'standing-hamstring-curls':
    'Activates hamstrings while standing with support. Bend the knee and bring the heel toward your seat.',
  'hamstring-stretch':
    'Stretches the back of the thigh. Keep the stretch gentle and breathe steadily.',
  'seated-knee-extension':
    'Strengthens the front of the thigh while seated. Straighten the knee, pause, then lower slowly.',
  'straight-leg-raise':
    'Strengthens hip flexors and core stability. Keep the leg straight and lift only as high as comfortable.',
  'quadriceps-stretch':
    'Stretches the front of the thigh. Hold a gentle stretch and avoid arching your back.',
  'triceps-stretch':
    'Stretches the back of the upper arm. Reach gently and keep breathing — do not force the stretch.',
  'chest-stretch':
    'Opens the chest and improves posture. Open the arms gently and keep shoulders relaxed.',
  'neck-flexion-extension':
    'Gently moves the neck through flexion and extension. Move slowly and stay within comfort.',
  'jaw-opening-closing':
    'Mobilises the jaw for comfort and range of motion. Open and close slowly without forcing.',
  'jaw-side-to-side':
    'Side-to-side jaw mobility exercise. Keep movements small and pain-free.',
  'neck-stretch':
    'Gentle neck stretch — tilt or turn slowly and stay within comfort. Stop if you feel pain.',
};

function detectSide(rawLabel: string): 'left' | 'right' | null {
  if (/\bright\b/i.test(rawLabel)) return 'right';
  if (/\bleft\b/i.test(rawLabel)) return 'left';
  return null;
}

function slugFromLabel(rawLabel: string): string {
  for (const rule of SLUG_RULES) {
    if (rule.pattern.test(rawLabel)) return rule.slug;
  }
  return rawLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function fallbackTitleFromLabel(rawLabel: string): string {
  const cleaned = rawLabel
    .replace(/\s+(Male|Female|Fmale)\s*/gi, ' ')
    .replace(/\s+(English|Tamil|Engish|Enlish|Englush)\w*/gi, ' ')
    .replace(/\s+\d+\s*Reps?\w*/gi, ' ')
    .replace(/\s+\d+\s*Eps\w*/gi, ' ')
    .replace(/\s+1\s*Min\w*/gi, ' ')
    .replace(/\s+New\d*/gi, ' ')
    .replace(/\s+With\s+Cot\b/gi, '')
    .replace(/\s+Exercise\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return 'Exercise';

  return cleaned
    .split(' ')
    .map((word) => {
      if (/^(and|&|to|with)$/i.test(word)) return word.toLowerCase();
      if (/^dbe$/i.test(word)) return 'DBE';
      if (/^tee$/i.test(word)) return 'TEE';
      if (/^slr$/i.test(word)) return 'SLR';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function titleForSlug(slug: string, rawLabel: string): string {
  const base = TITLES[slug] ?? fallbackTitleFromLabel(rawLabel);
  const side = detectSide(rawLabel);
  if (!side) return base;
  // Avoid "Left Left" if fallback already kept the side word.
  if (/\b(left|right)\b/i.test(base)) return base;
  const sideLabel = side === 'left' ? 'Left' : 'Right';
  return `${base} (${sideLabel})`;
}

export function resolvePathwayExerciseCopy(rawLabel: string): PathwayExerciseCopy {
  const slug = slugFromLabel(rawLabel);
  const side = detectSide(rawLabel);
  const idSlug = side ? `${slug}-${side}` : slug;
  const title = titleForSlug(slug, rawLabel) || 'Exercise';
  const description =
    getClinicalExerciseDescription(idSlug, 'en') ??
    DESCRIPTIONS[slug] ??
    'Follow the instructor in the video. Move slowly, stay within comfort, and pause if you feel unwell.';
  return { slug: idSlug, title, description };
}
