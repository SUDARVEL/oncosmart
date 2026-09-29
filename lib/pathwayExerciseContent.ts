/**
 * Map pathway filename labels → stable exercise slugs + copy.
 * Falls back to a cleaned filename title when unknown.
 */

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
  { pattern: /neck flexion|flexion and extension/i, slug: 'neck-flexion-extension' },
  { pattern: /mouth opening|jaw opening/i, slug: 'jaw-opening-closing' },
  { pattern: /jaw side|side-to-side/i, slug: 'jaw-side-to-side' },
  { pattern: /neck stretch/i, slug: 'neck-stretch' },
];

const DESCRIPTIONS: Record<string, string> = {
  'diaphragmatic-breathing':
    'Helps improve lung expansion and oxygen supply. Breathe in through your nose and out through your mouth with relaxed shoulders.',
  'ankle-pumps': 'Improves blood circulation and reduces stiffness in the legs.',
  'thoracic-expansion': 'Improves chest expansion and ventilation.',
  'arm-circles': 'Improves shoulder mobility and circulation.',
  'arm-rotation': 'Gently mobilises the shoulders and upper back.',
  'spot-marching': 'Light marching in place to warm up and improve circulation.',
  'shoulder-shrugging': 'Releases tension in the neck and shoulders.',
  'biceps-curls': 'Maintains arm strength with a controlled curling motion.',
  'wall-pushup': 'Builds upper-body strength using the wall for support.',
  'wall-slides': 'Improves shoulder mobility along the wall.',
  'wall-climbing': 'Shoulder mobility exercise mimicking climbing on the wall.',
  'calf-raise': 'Strengthens calf muscles and ankle stability.',
  'calf-stretch': 'Stretches the calf muscles to improve flexibility.',
  'standing-hamstring-curls': 'Activates hamstrings while standing with support.',
  'hamstring-stretch': 'Stretches the back of the thigh.',
  'seated-knee-extension': 'Strengthens the front of the thigh while seated.',
  'straight-leg-raise': 'Strengthens hip flexors and core stability.',
  'quadriceps-stretch': 'Stretches the front of the thigh.',
  'triceps-stretch': 'Stretches the back of the upper arm.',
  'chest-stretch': 'Opens the chest and improves posture.',
  'neck-flexion-extension': 'Gently moves the neck through flexion and extension.',
  'jaw-opening-closing': 'Mobilises the jaw for comfort and range of motion.',
  'jaw-side-to-side': 'Side-to-side jaw mobility exercise.',
  'neck-stretch': 'Gentle neck stretch — move slowly and stay within comfort.',
};

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

function titleFromLabel(rawLabel: string): string {
  return rawLabel
    .replace(/\s+(Male|Female)\s+(English|Tamil).*$/i, '')
    .replace(/\s+\d+\s*Reps.*$/i, '')
    .replace(/\s+\d+\s*Eps.*$/i, '')
    .replace(/\s+1\s*Min.*$/i, '')
    .replace(/\s+New\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolvePathwayExerciseCopy(rawLabel: string): PathwayExerciseCopy {
  const slug = slugFromLabel(rawLabel);
  const title = titleFromLabel(rawLabel) || 'Exercise';
  const description =
    DESCRIPTIONS[slug] ??
    'Follow the instructor in the video. Move slowly, stay within comfort, and pause if you feel unwell.';
  return { slug, title, description };
}
