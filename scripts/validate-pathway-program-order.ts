/**
 * Every cancer, level, gender, and language follows the pathway tables.
 * Run: npx tsx scripts/validate-pathway-program-order.ts
 */
import pathwayVideos from '../data/pathway-videos.json';
import { CANCER_TYPE_SLUGS, type PathwayProfile } from '../lib/cancerPathway';
import { getPathwayExerciseSequence } from '../lib/cancerPathwayPrograms';
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
        const expected = getPathwayExerciseSequence(cancerType, level).map((key) =>
          key === 'arm-rotation' ? 'arm-circles' : key,
        );
        byLevel[level] = got.join('|');
        const label = `${gender} ${language} ${cancerType} L${level}`;
        if (got.join('|') !== expected.join('|')) {
          fail(`${label}\n  got ${got.join(', ')}\n  exp ${expected.join(', ')}`);
        }
        if (session.length === 0) fail(`${label} is empty`);
        if (cancerType === 'head-neck' && got.includes('ankle-pumps')) {
          fail(`${label} includes ankle pumps`);
        }
      }
      const label = `${gender} ${language} ${cancerType}`;
      if (byLevel[3] !== byLevel[2]) fail(`${label} L3 is not the Level 2 order`);
      if (byLevel[4] !== byLevel[2]) fail(`${label} L4 is not the Level 2 order`);
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
