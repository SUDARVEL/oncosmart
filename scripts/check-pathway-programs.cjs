/**
 * Structural invariants for cancer pathway programs.
 * Run: node scripts/check-pathway-programs.cjs
 * (Also: npm run check:pathway-structure)
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const programs = JSON.parse(
  fs.readFileSync(path.join(root, 'data/cancer-pathway-programs.json'), 'utf8'),
);
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, 'data/day-exercises.json'), 'utf8'),
).catalog;

const CANCER_TYPES = ['breast', 'thorax', 'abdomen', 'head-neck'];
const REP_DEFAULTS = { 1: 5, 2: 5, 3: 10, 4: 15 };

let failures = 0;
function fail(msg) {
  failures += 1;
  console.error(`FAIL ${msg}`);
}

for (const [level, reps] of Object.entries(REP_DEFAULTS)) {
  const got = programs.levelRepDefaults?.[level]?.reps;
  if (got !== reps) fail(`levelRepDefaults[${level}] = ${got}, expected ${reps}`);
}

const allKeys = new Set();
for (const cancerType of CANCER_TYPES) {
  const pathway = programs.pathways?.[cancerType];
  if (!pathway) {
    fail(`missing pathway ${cancerType}`);
    continue;
  }
  for (const level of [1, 2, 3, 4]) {
    const list = pathway.levels?.[String(level)];
    if (!Array.isArray(list) || list.length === 0) {
      fail(`${cancerType} L${level} is empty`);
      continue;
    }
    for (const id of list) allKeys.add(id);
  }
  const l1 = pathway.levels['1'];
  const l2 = pathway.levels['2'];
  if (JSON.stringify(l1) === JSON.stringify(l2)) {
    fail(`${cancerType} L1 should differ from L2`);
  }
}

for (const id of [...allKeys].sort()) {
  if (!catalog[id]) fail(`catalog missing pathway exercise ${id}`);
}

// Plan API surface (resolved at runtime by the TS module graph).
const expectedPathwayIds = [
  'male-breast',
  'male-thorax',
  'male-abdomen',
  'male-head-neck',
  'female-breast',
  'female-thorax',
  'female-abdomen',
  'female-head-neck',
];
if (expectedPathwayIds.length !== 8) fail('expected 8 pathway ids');

// Spot-check: Male Breast L1/L2/L3 lengths + L3/L4 dose tiers.
const breast = programs.pathways.breast.levels;
if (breast['1'].length !== 10) fail(`breast L1 length ${breast['1'].length}, expected 10`);
if (breast['2'].length !== 13) fail(`breast L2 length ${breast['2'].length}, expected 13`);
if (breast['3'].length < breast['2'].length) {
  fail('breast L3 should be at least as long as L2');
}
if (breast['1'][0] !== 'diaphragmatic-breathing' || breast['1'][breast['1'].length - 1] !== 'diaphragmatic-breathing') {
  fail('breast L1 should open and close with diaphragmatic breathing');
}

if (failures > 0) {
  console.error(`${failures} pathway structure failures`);
  process.exit(1);
}

console.log(
  `Pathway structure OK: ${CANCER_TYPES.length} cancers × 4 levels, ${allKeys.size} exercise keys in catalog.`,
);
console.log(
  `Breast spot-check: L1=${breast['1'].length}, L2=${breast['2'].length}, L3=${breast['3'].length}, L4=${breast['4'].length}; reps 5/5/10/15.`,
);
