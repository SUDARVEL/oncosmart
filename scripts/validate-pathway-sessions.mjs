/**
 * Validates pathway session building for all gender×language×cancer×level combos
 * and refreshes data/pathway-videos.json.
 *
 * Run: node scripts/validate-pathway-sessions.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'data', 'pathway-videos.json');

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || 'https://soyaeuffzytrjojifvdz.supabase.co';
const SUPABASE_ANON =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveWFldWZmenl0cmpvamlmdmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjk2MzYsImV4cCI6MjA5Njk0NTYzNn0.WmitCLz5piK5C4r4WJ5mHX50gRn-BOGFnPQH-bJZfCY';

const EXPECTED = {
  breast: { 1: 12, 2: 15, 3: 15, 4: 15 },
  thorax: { 1: 12, 2: 20, 3: 20, 4: 20 },
  abdomen: { 1: 16, 2: 21, 3: 21, 4: 21 },
  'head-neck': { 1: 9, 2: 11, 3: 11, 4: 11 },
};

const SLUG_RULES = [
  { pattern: /\bdbe\b|diaphragmatic|breathing exercise/i, slug: 'diaphragmatic-breathing' },
  { pattern: /ankle pump/i, slug: 'ankle-pumps' },
  { pattern: /\btee\b|thoracic expansion/i, slug: 'thoracic-expansion' },
  { pattern: /arm circle/i, slug: 'arm-circles' },
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
  { pattern: /neck flexion|flexion\s*(and|&|ad)?\s*extension/i, slug: 'neck-flexion-extension' },
  { pattern: /mouth opening|jaw opening/i, slug: 'jaw-opening-closing' },
  { pattern: /jaw side|side[\s-]*to[\s-]*side/i, slug: 'jaw-side-to-side' },
  { pattern: /neck stretch/i, slug: 'neck-stretch' },
];

function getPathwayStorageRoot(gender, language) {
  const langLabel = language === 'ta' ? 'Tamil' : 'English';
  return `${gender === 'female' ? 'Female' : 'Male'} - ${langLabel}`;
}

function cancerPathMatchesSlug(cancerFolderSegment, slug) {
  const lower = cancerFolderSegment.toLowerCase();
  if (slug === 'breast') return lower.includes('breast');
  if (slug === 'abdomen') return lower.includes('abdomen');
  if (slug === 'head-neck') return lower.includes('head') && lower.includes('neck');
  if (slug === 'thorax') return lower.includes('thorax');
  return false;
}

function parseLevelFromStoragePath(objectPath) {
  const match = /\/Level\s*(\d+)/i.exec(objectPath);
  if (!match) return null;
  const level = Number(match[1]);
  return Number.isFinite(level) && level >= 1 && level <= 4 ? level : null;
}

const ORDER_PREFIX = /^(\d+)\s*[.,]?\s*/;

function parsePathwayFilename(fileName) {
  const base = fileName.replace(/\.mp4$/i, '').trim();
  const orderMatch = ORDER_PREFIX.exec(base);
  const sortOrder = orderMatch ? Number(orderMatch[1]) : 9999;
  const rawLabel = orderMatch ? base.slice(orderMatch[0].length).trim() : base;
  const lower = rawLabel.toLowerCase();
  let displayLabel = 'SECS';
  let displayValue = '30';
  if (/\b1\s*min\b/i.test(rawLabel) || lower.includes('1min')) {
    displayLabel = 'MINS';
    displayValue = '01';
  } else {
    const repsMatch = /(\d+)\s*reps\b/i.exec(rawLabel) ?? /(\d+)\s*eps\b/i.exec(rawLabel);
    if (repsMatch) {
      const count = Number(repsMatch[1]);
      const safe = Number.isFinite(count) && count > 0 ? count : 5;
      displayLabel = 'REPS';
      displayValue = safe < 10 ? `0${safe}` : String(safe);
    }
  }
  return { sortOrder, sortTieBreak: fileName, rawLabel, displayValue, displayLabel };
}

function comparePathwayFiles(a, b) {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.sortTieBreak.localeCompare(b.sortTieBreak);
}

function slugFromLabel(rawLabel) {
  for (const rule of SLUG_RULES) {
    if (rule.pattern.test(rawLabel)) return rule.slug;
  }
  return null;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
const { data, error } = await supabase.rpc('list_pathway_video_paths');
if (error) throw error;
const paths = data.filter((p) => typeof p === 'string' && p.toLowerCase().endsWith('.mp4'));

let failures = 0;
const unknownLabels = new Set();

for (const gender of ['male', 'female']) {
  for (const language of ['en', 'ta']) {
    for (const cancer of ['breast', 'thorax', 'abdomen', 'head-neck']) {
      for (let level = 1; level <= 4; level += 1) {
        const root = getPathwayStorageRoot(gender, language);
        const levelPaths = paths.filter((objectPath) => {
          if (!objectPath.startsWith(`${root}/`)) return false;
          const cancerFolder = objectPath.split('/')[1] ?? '';
          if (!cancerPathMatchesSlug(cancerFolder, cancer)) return false;
          return parseLevelFromStoragePath(objectPath) === level;
        });

        const expected = EXPECTED[cancer][level];
        if (levelPaths.length !== expected) {
          console.error(
            `FAIL ${root} / ${cancer} / L${level}: got ${levelPaths.length}, expected ${expected}`,
          );
          failures += 1;
          continue;
        }

        const metas = levelPaths.map((p) => parsePathwayFilename(p.split('/').pop()));
        metas.sort(comparePathwayFiles);

        for (const meta of metas) {
          if (!slugFromLabel(meta.rawLabel)) {
            unknownLabels.add(meta.rawLabel);
          }
          if (!meta.displayValue) {
            console.error(`FAIL missing reps for ${meta.rawLabel}`);
            failures += 1;
          }
        }

        console.log(
          `OK ${root.padEnd(18)} ${cancer.padEnd(10)} L${level}  ${String(levelPaths.length).padStart(2)} steps`,
        );
      }
    }
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      bucket: 'Oncosmart Videos and Assets',
      count: paths.length,
      paths: [...paths].sort((a, b) => a.localeCompare(b)),
    },
    null,
    2,
  )}\n`,
);
console.log(`\nWrote bundled manifest: ${paths.length} paths → ${outPath}`);

if (unknownLabels.size > 0) {
  console.warn(`\nUnknown exercise labels (still playable with cleaned titles): ${unknownLabels.size}`);
  for (const label of [...unknownLabels].sort()) {
    console.warn(`  - ${label}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} validation failure(s)`);
  process.exit(1);
}

console.log('\nAll 64 pathway sessions validated (4 genders/langs × 4 cancers × 4 levels).');
