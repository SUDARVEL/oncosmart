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
import { buildPathwaySessionFromManifest } from '../lib/pathwayVideoIndex';

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
            const fresh = stored.startsWith('Newly added');
            if (fresh !== usesNewLibraryClip(step, cancerType, level)) {
              fail(`${label} ${step} video ${stored}`);
            }
          }
          const path = group[0]?.storageObjectPath ?? '';
          if (step === 'arm-circles' && cancerType === 'breast' && level === 1 && !/short lever/i.test(path)) {
            fail(`${label} arm circles is not the short-lever clip`);
          }
          if (step === 'pelvic-bridge' && level === 4 && !/unilateral/i.test(path)) {
            fail(`${label} pelvic bridge is not the unilateral clip`);
          }
          if (step === 'neck-rotation' && level === 1 && !/1\s*st\s*level/i.test(path)) {
            fail(`${label} neck rotation is not the 1st-level clip`);
          }
        }
        if (cursor !== session.length) fail(`${label} has extra steps`);
      }
      const label = `${gender} ${language} ${cancerType}`;
      if (byLevel[1] === byLevel[2]) fail(`${label} L1 matches L2`);
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
