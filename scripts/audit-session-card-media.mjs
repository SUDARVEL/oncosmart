/**
 * Full matrix audit: cancer × level × gender × language → session card media.
 *
 * Run: node scripts/audit-session-card-media.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || 'https://soyaeuffzytrjojifvdz.supabase.co';
const SUPABASE_ANON =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveWFldWZmenl0cmpvamlmdmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjk2MzYsImV4cCI6MjA5Njk0NTYzNn0.WmitCLz5piK5C4r4WJ5mHX50gRn-BOGFnPQH-bJZfCY';
const PUBLIC = `${SUPABASE_URL}/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets`;

const programs = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'data/cancer-pathway-programs.json'), 'utf8'),
);
const assetsSrc = fs.readFileSync(path.join(rootDir, 'lib/phase2LandscapeAssets.ts'), 'utf8');

function parseMap(name) {
  const re = new RegExp(`export const ${name}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\};`);
  const m = assetsSrc.match(re);
  const out = {};
  for (const line of (m?.[1] || '').split('\n')) {
    const mm = line.match(/'([^']+)':\s*'([^']+)'/);
    if (mm) out[mm[1]] = mm[2];
  }
  return out;
}

const MALE_V = parseMap('PHASE2_MALE_LANDSCAPE_VIDEOS');
const FEMALE_V = parseMap('PHASE2_FEMALE_LANDSCAPE_VIDEOS');
const MALE_P = parseMap('PHASE2_MALE_LANDSCAPE_PHOTOS');
const FEMALE_P = parseMap('PHASE2_FEMALE_LANDSCAPE_PHOTOS');
const ROOT = 'Oncosmart Phase II Landscape';

const SLUG_RULES = [
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

function detectSide(raw) {
  if (/\bright\b/i.test(raw)) return 'right';
  if (/\bleft\b/i.test(raw)) return 'left';
  return null;
}

function resolveCopy(rawLabel) {
  let slug = null;
  for (const rule of SLUG_RULES) {
    if (rule.pattern.test(rawLabel)) {
      slug = rule.slug;
      break;
    }
  }
  if (!slug) {
    slug = rawLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);
  }
  const side = detectSide(rawLabel);
  return side ? `${slug}-${side}` : slug;
}

function programKeyFromStorageSlug(storageSlug) {
  const base = storageSlug.replace(/-(left|right)$/i, '').toLowerCase();
  const known = new Set([
    'diaphragmatic-breathing',
    'ankle-pumps',
    'thoracic-expansion',
    'chest-stretch',
    'arm-circles',
    'arm-rotation',
    'biceps-curls',
    'wall-climbing',
    'triceps-stretch',
    'spot-marching',
    'shoulder-shrugging',
    'wall-slides',
    'wall-pushup',
    'seated-knee-extension',
    'standing-hamstring-curls',
    'hamstring-stretch',
    'quadriceps-stretch',
    'straight-leg-raise',
    'calf-raise',
    'calf-stretch',
    'neck-flexion-extension',
    'jaw-opening-closing',
    'jaw-side-to-side',
    'neck-stretch',
  ]);
  return known.has(base) ? base : null;
}

function matchesProgram(storageSlug, programKey) {
  const key = programKeyFromStorageSlug(storageSlug);
  if (!key) return false;
  if (key === programKey) return true;
  if (
    (programKey === 'arm-rotation' && key === 'arm-circles') ||
    (programKey === 'arm-circles' && key === 'arm-rotation')
  ) {
    return true;
  }
  return false;
}

function getSequence(cancer, level) {
  const seqLevel = level <= 1 ? 1 : 2;
  return programs.pathways[cancer]?.levels[String(seqLevel)] ?? [];
}

function cancerMatch(folder, slug) {
  const lower = folder.toLowerCase();
  if (slug === 'breast') return lower.includes('breast');
  if (slug === 'abdomen') return lower.includes('abdomen');
  if (slug === 'head-neck') return lower.includes('head') && lower.includes('neck');
  if (slug === 'thorax') return lower.includes('thorax');
  return false;
}

function parseLevel(objectPath) {
  const m = /\/Level\s*(\d+)/i.exec(objectPath);
  return m ? Number(m[1]) : null;
}

function parseFilename(fileName) {
  const base = fileName.replace(/\.mp4$/i, '').trim();
  const om = /^(\d+)\s*[.,]?\s*/.exec(base);
  const sortOrder = om ? Number(om[1]) : 9999;
  const rawLabel = om ? base.slice(om[0].length).trim() : base;
  return { sortOrder, sortTieBreak: fileName, rawLabel };
}

function sideRank(slug) {
  if (slug.endsWith('-left')) return 0;
  if (slug.endsWith('-right')) return 1;
  return 2;
}

function phase2Candidates(exerciseId) {
  const id = exerciseId.trim().toLowerCase();
  const base = id.replace(/-(left|right)$/i, '');
  const candidates = [id];
  if (base !== id) candidates.push(base);
  if (base === 'arm-rotation') candidates.push('arm-circles');
  if (base === 'arm-circles') candidates.push('arm-rotation');
  if (base === id) candidates.push(`${base}-left`, `${base}-right`);
  return [...new Set(candidates)];
}

function resolvePhase2(slug, gender) {
  const mapV = gender === 'female' ? FEMALE_V : MALE_V;
  const mapP = gender === 'female' ? FEMALE_P : MALE_P;
  let videoRel = null;
  let photoRel = null;
  let videoKey = null;
  let photoKey = null;
  for (const key of phase2Candidates(slug)) {
    if (!videoRel && mapV[key]) {
      videoRel = mapV[key];
      videoKey = key;
    }
    if (!photoRel && mapP[key]) {
      photoRel = mapP[key];
      photoKey = key;
    }
  }
  return { videoRel, photoRel, videoKey, photoKey };
}

function encodeObjectPath(objectPath) {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function urlFor(rel) {
  return `${PUBLIC}/${encodeObjectPath(`${ROOT}/${rel}`)}`;
}

function buildSession(paths, gender, language, cancer, level) {
  const storageRoot = `${gender === 'female' ? 'Female' : 'Male'} - ${
    language === 'ta' ? 'Tamil' : 'English'
  }`;
  const levelPaths = paths.filter((objectPath) => {
    if (!objectPath.startsWith(`${storageRoot}/`)) return false;
    const cancerFolder = objectPath.split('/')[1] ?? '';
    if (!cancerMatch(cancerFolder, cancer)) return false;
    return parseLevel(objectPath) === level;
  });

  const clips = levelPaths.map((objectPath) => {
    const fileName = objectPath.split('/').pop();
    const fileMeta = parseFilename(fileName);
    const slug = resolveCopy(fileMeta.rawLabel);
    return { objectPath, fileMeta, slug };
  });

  const program = getSequence(cancer, level);
  const remaining = [...clips];
  const ordered = [];

  for (const step of program) {
    const matches = remaining
      .filter((clip) => matchesProgram(clip.slug, step))
      .sort((a, b) => {
        const side = sideRank(a.slug) - sideRank(b.slug);
        if (side !== 0) return side;
        if (a.fileMeta.sortOrder !== b.fileMeta.sortOrder) {
          return a.fileMeta.sortOrder - b.fileMeta.sortOrder;
        }
        return a.fileMeta.sortTieBreak.localeCompare(b.fileMeta.sortTieBreak);
      });
    if (!matches.length) continue;
    const nextOrder = matches[0].fileMeta.sortOrder;
    const group = matches
      .filter((clip) => clip.fileMeta.sortOrder === nextOrder)
      .sort((a, b) => {
        const side = sideRank(a.slug) - sideRank(b.slug);
        if (side !== 0) return side;
        return a.fileMeta.sortTieBreak.localeCompare(b.fileMeta.sortTieBreak);
      });
    for (const match of group) {
      ordered.push(match);
      remaining.splice(remaining.indexOf(match), 1);
    }
  }

  remaining.sort((a, b) => a.fileMeta.sortOrder - b.fileMeta.sortOrder);
  return [...ordered, ...remaining];
}

const urlStatus = new Map();

async function head(url) {
  if (urlStatus.has(url)) return urlStatus.get(url);
  try {
    const response = await fetch(url, { method: 'HEAD' });
    urlStatus.set(url, response.status);
    return response.status;
  } catch {
    urlStatus.set(url, 0);
    return 0;
  }
}

const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
let { data, error } = await sb.rpc('list_pathway_video_paths');
if (error || !Array.isArray(data) || data.length === 0) {
  console.warn('RPC failed/empty, using bundled manifest', error?.message);
  data = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/pathway-videos.json'), 'utf8')).paths;
}
const paths = data.filter((p) => typeof p === 'string' && p.toLowerCase().endsWith('.mp4'));
console.log(`Pathway paths: ${paths.length}`);

const gaps = [];
const sessionStats = [];
const genders = ['male', 'female'];
const languages = ['en', 'ta'];
const cancers = ['breast', 'thorax', 'abdomen', 'head-neck'];

for (const gender of genders) {
  for (const language of languages) {
    for (const cancer of cancers) {
      for (let level = 1; level <= 4; level += 1) {
        const session = buildSession(paths, gender, language, cancer, level);
        let ok = 0;
        let missing = 0;
        for (const step of session) {
          const media = resolvePhase2(step.slug, gender);
          const videoUrl = media.videoRel ? urlFor(media.videoRel) : null;
          const photoUrl = media.photoRel ? urlFor(media.photoRel) : null;
          const videoStatus = videoUrl ? await head(videoUrl) : null;
          const photoStatus = photoUrl ? await head(photoUrl) : null;
          // App fallback: guided pathway clip when Phase II has no landscape asset.
          const pathwayUrl = `${PUBLIC}/${encodeObjectPath(step.objectPath)}`;
          const pathwayStatus =
            videoStatus === 200 || photoStatus === 200 ? null : await head(pathwayUrl);
          const hasWorking =
            videoStatus === 200 || photoStatus === 200 || pathwayStatus === 200;
          if (!hasWorking) {
            missing += 1;
            gaps.push({
              gender,
              language,
              cancer,
              level,
              slug: step.slug,
              file: step.objectPath.split('/').pop(),
              videoKey: media.videoKey,
              photoKey: media.photoKey,
              videoStatus,
              photoStatus,
              pathwayStatus,
            });
          } else {
            ok += 1;
          }
        }
        sessionStats.push({
          gender,
          language,
          cancer,
          level,
          steps: session.length,
          ok,
          missing,
        });
        const mark = missing ? 'GAP' : 'OK ';
        console.log(
          `${mark} ${gender.padEnd(6)} ${language} ${cancer.padEnd(10)} L${level}  steps=${String(
            session.length,
          ).padStart(2)} ok=${ok} missing=${missing}`,
        );
      }
    }
  }
}

console.log('\n======== GAPS (no working Phase II card video OR photo) ========');
if (!gaps.length) console.log('(none)');

const uniq = new Map();
for (const gap of gaps) {
  const key = `${gap.gender}|${gap.slug}`;
  if (!uniq.has(key)) uniq.set(key, { ...gap, sessions: [] });
  uniq.get(key).sessions.push(`${gap.cancer}/L${gap.level}/${gap.language}`);
}

for (const gap of uniq.values()) {
  console.log(
    `  [${gap.gender}] ${gap.slug}  video=${gap.videoKey || '-'}(${gap.videoStatus ?? '-'}) photo=${gap.photoKey || '-'}(${gap.photoStatus ?? '-'})  e.g. ${gap.file}`,
  );
  const sessions = [...new Set(gap.sessions)];
  console.log(
    `    in: ${sessions.slice(0, 12).join(', ')}${sessions.length > 12 ? '…' : ''}`,
  );
}

const totalSessions = sessionStats.length;
const gapSessions = sessionStats.filter((s) => s.missing > 0).length;
const totalSteps = sessionStats.reduce((a, s) => a + s.steps, 0);
const totalOk = sessionStats.reduce((a, s) => a + s.ok, 0);

const outDir = '/opt/cursor/artifacts';
fs.mkdirSync(outDir, { recursive: true });

const summary = {
  pathwayPaths: paths.length,
  sessionsChecked: totalSessions,
  sessionsWithGaps: gapSessions,
  totalCardSlots: totalSteps,
  cardsWithMedia: totalOk,
  cardsMissing: totalSteps - totalOk,
  uniqueGapSlugs: [...uniq.keys()],
  gaps: [...uniq.values()].map((gap) => ({
    gender: gap.gender,
    slug: gap.slug,
    videoKey: gap.videoKey,
    photoKey: gap.photoKey,
    videoStatus: gap.videoStatus,
    photoStatus: gap.photoStatus,
    exampleFile: gap.file,
    sessionCount: gap.sessions.length,
    sessions: [...new Set(gap.sessions)],
  })),
  sessionStats,
};

fs.writeFileSync(path.join(outDir, 'full-matrix-card-media-audit.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(
  path.join(outDir, 'full-matrix-card-media-audit.txt'),
  [
    'Full matrix session-card media audit',
    '====================================',
    `Pathway paths: ${paths.length}`,
    `Sessions checked: ${totalSessions} (2 genders × 2 languages × 4 cancers × 4 levels)`,
    `Card slots: ${totalSteps}  with media: ${totalOk}  missing: ${totalSteps - totalOk}`,
    `Sessions with any gap: ${gapSessions}`,
    '',
    'Unique gap slugs:',
    ...[...uniq.values()].map(
      (gap) => `  - [${gap.gender}] ${gap.slug} (${gap.sessions.length} occurrences)`,
    ),
    '',
    'Note: Levels 3–4 reuse Level 2 exercise sequence; media is shared.',
    'Note: When Phase II landscape is missing, the guided pathway clip is used on the card.',
  ].join('\n') + '\n',
);

console.log(`\nWrote ${outDir}/full-matrix-card-media-audit.{txt,json}`);
console.log(`TOTAL missing card slots: ${totalSteps - totalOk} / ${totalSteps}`);
if (totalSteps - totalOk > 0) process.exitCode = 1;
