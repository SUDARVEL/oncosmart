/**
 * Every cancer, level, gender, and language follows the pathway tables.
 * Run: npx tsx scripts/validate-pathway-program-order.ts
 */
import pathwayVideos from '../data/pathway-videos.json';
import { CANCER_TYPE_SLUGS, type PathwayProfile } from '../lib/cancerPathway';
import {
  getPathwayExerciseSequence,
  getPathwayStepDose,
  usesNewLibraryClip,
  type PathwayExerciseKey,
} from '../lib/cancerPathwayPrograms';
import { buildPathwaySessionFromManifest, isSpirometerFolderPath } from '../lib/pathwayVideoIndex';

const paths = pathwayVideos.paths;

const genders = ['female', 'male'] as const;
const languages = ['en', 'ta'] as const;

function baseSlug(id: string): string {
  return id.replace(/^pathway-.+-s\d+-/, '').replace(/-(left|right)$/i, '');
}

function collapsedKeys(ids: string[]): string[] {
  const keys: string[] = [];
  for (const id of ids) {
    const key = baseSlug(id);
    if (keys[keys.length - 1] !== key) keys.push(key);
  }
  return keys;
}

let failures = 0;

function fail(message: string) {
  failures += 1;
  console.error(`FAIL ${message}`);
}

const sidesByExercise = new Map<string, Map<string, Set<'left' | 'right'>>>();

function baseTitle(title: string): string {
  return title.replace(/ \((Left|Right)\)$/, '');
}

function sideOfTitle(title: string): 'left' | 'right' | null {
  if (title.endsWith('(Left)')) return 'left';
  if (title.endsWith('(Right)')) return 'right';
  return null;
}

for (const gender of genders) {
  for (const language of languages) {
    for (const cancerType of CANCER_TYPE_SLUGS) {
      const profile: PathwayProfile = {
        gender,
        avatar: gender,
        language,
        cancerType,
      };
      const byLevel: Record<number, string> = {};
      for (const level of [1, 2, 3, 4]) {
        const session = buildPathwaySessionFromManifest(paths, profile, level);
        const got = collapsedKeys(session.map((entry) => entry.id));
        const sequence = getPathwayExerciseSequence(cancerType, level);
        const expected = sequence.map((key) => (key === 'arm-rotation' ? 'arm-circles' : key));
        byLevel[level] = got.join('|');
        const label = `${gender} ${language} ${cancerType} L${level}`;
        if (got.join('|') !== expected.join('|')) {
          fail(`${label}\n  got ${got.join(', ')}\n  exp ${expected.join(', ')}`);
        }
        if (session.length === 0) fail(`${label} is empty`);
        if (cancerType === 'head-neck' && got.includes('ankle-pumps')) {
          fail(`${label} includes ankle pumps`);
        }

        let cursor = 0;
        for (const step of sequence) {
          const shown = step === 'arm-rotation' ? 'arm-circles' : step;
          const group = [];
          while (cursor < session.length && baseSlug(session[cursor]!.id) === shown) {
            group.push(session[cursor]!);
            cursor += 1;
          }
          if (group.length === 0) {
            fail(`${label} missing ${step}`);
            continue;
          }
          const dose = getPathwayStepDose(step as PathwayExerciseKey, level);
          for (const item of group) {
            if (item.repValue !== dose.repValue || item.displayLabel !== dose.displayLabel) {
              fail(
                `${label} ${step} dose ${item.displayValue} ${item.displayLabel}, expected ${dose.displayValue} ${dose.displayLabel}`,
              );
            }
            const stored = item.storageObjectPath ?? '';
            const fresh = stored.startsWith('Newly added') || isSpirometerFolderPath(stored);
            if (fresh !== usesNewLibraryClip(step, cancerType, level)) {
              fail(`${label} ${step} video ${stored}`);
            }
          }
          const path = group[0]?.storageObjectPath ?? '';
          if (step === 'arm-circles' && cancerType === 'breast' && level === 1 && !/short lever/i.test(path)) {
            fail(`${label} arm circles is not the short-lever clip`);
          }
          if (step === 'unilateral-bridge' && !/unilateral/i.test(path)) {
            fail(`${label} unilateral bridge is not the one-leg clip`);
          }
          if (step === 'pelvic-bridge' && /unilateral/i.test(path)) {
            fail(`${label} pelvic bridge is using the one-leg clip`);
          }
          if (step === 'neck-rotation' && level === 1 && !/1\s*st\s*level/i.test(path)) {
            fail(`${label} neck rotation is not the 1st-level clip`);
          }
        }
        if (cursor !== session.length) fail(`${label} has extra steps`);

        for (const item of session) {
          const title = item.title ?? '';
          const side = sideOfTitle(title);
          if (!side) continue;
          const key = `${cancerType} L${level} ${baseTitle(title)}`;
          const profiles = sidesByExercise.get(key) ?? new Map<string, Set<'left' | 'right'>>();
          const sides = profiles.get(`${gender} ${language}`) ?? new Set<'left' | 'right'>();
          sides.add(side);
          profiles.set(`${gender} ${language}`, sides);
          sidesByExercise.set(key, profiles);
        }
      }
      const label = `${gender} ${language} ${cancerType}`;
      if (byLevel[1] === byLevel[2]) fail(`${label} L1 matches L2`);
    }
  }
}

for (const [exercise, profiles] of sidesByExercise) {
  const both = [...profiles.values()].some((sides) => sides.has('left') && sides.has('right'));
  if (!both) continue;
  for (const [profile, sides] of profiles) {
    if (!sides.has('left') || !sides.has('right')) {
      const missing = sides.has('left') ? 'right' : 'left';
      fail(`${profile} ${exercise} is missing the ${missing} side`);
    }
  }
}

if (failures > 0) {
  console.error(`${failures} pathway order failures`);
  process.exit(1);
}

console.log(
  `Pathway order matches the tables for ${CANCER_TYPE_SLUGS.length} cancers × 4 levels × 4 profiles.`,
);

export {};
