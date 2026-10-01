/**
 * Ensures Male-English sessions follow the diagram program order for Breast L1/L2.
 * Run: npx tsx scripts/validate-pathway-program-order.ts
 */
import { createClient } from '@supabase/supabase-js';
import { buildGuidedExercisesFromPaths } from '../lib/pathwayVideoIndex';
import type { CancerTypeSlug } from '../lib/cancerPathway';

const SUPABASE_URL = 'https://soyaeuffzytrjojifvdz.supabase.co';
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveWFldWZmenl0cmpvamlmdmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjk2MzYsImV4cCI6MjA5Njk0NTYzNn0.WmitCLz5piK5C4r4WJ5mHX50gRn-BOGFnPQH-bJZfCY';

/** Expected title prefixes in order (L/R pairs listed separately). */
const EXPECTED: Record<string, string[]> = {
  'breast:1': [
    'Diaphragmatic Breathing',
    'Ankle Pumps',
    'Thoracic Expansion Exercise',
    'Pectoralis Stretch',
    'Arm Circles',
    'Biceps Curls',
    'Wall Climbing (Left)',
    'Wall Climbing (Right)',
    'Triceps Stretch (Left)',
    'Triceps Stretch (Right)',
    'Spot Marching',
    'Diaphragmatic Breathing',
  ],
  'breast:2': [
    'Diaphragmatic Breathing',
    'Ankle Pumps',
    'Thoracic Expansion Exercise',
    'Pectoralis Stretch',
    'Arm Circles',
    'Biceps Curls',
    'Shoulder Shrugging',
    'Wall Climbing (Left)',
    'Wall Climbing (Right)',
    'Wall Slides',
    'Wall Push-up',
    'Triceps Stretch (Left)',
    'Triceps Stretch (Right)',
    'Spot Marching',
    'Diaphragmatic Breathing',
  ],
};

async function main() {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
  const { data, error } = await sb.rpc('list_pathway_video_paths');
  if (error) throw error;
  const paths = (data as string[]).filter((p) => typeof p === 'string');

  let failures = 0;

  for (const [key, expectedTitles] of Object.entries(EXPECTED)) {
    const [cancer, levelStr] = key.split(':') as [CancerTypeSlug, string];
    const level = Number(levelStr);
    const levelPaths = paths.filter((objectPath) => {
      if (!objectPath.startsWith('Male - English/')) return false;
      const seg = (objectPath.split('/')[1] ?? '').toLowerCase();
      if (!seg.includes('breast')) return false;
      const match = /\/Level\s*(\d+)/i.exec(objectPath);
      return match != null && Number(match[1]) === level;
    });

    const session = buildGuidedExercisesFromPaths(levelPaths, level, {
      gender: 'male',
      avatar: 'male',
      language: 'en',
      cancerType: cancer,
    });

    const titles = session.map((entry) => entry.title);
    const ok =
      titles.length === expectedTitles.length &&
      titles.every((title, index) => title === expectedTitles[index]);

    if (!ok) {
      failures += 1;
      console.error(`FAIL ${key}`);
      console.error('  got     ', titles);
      console.error('  expected', expectedTitles);
    } else {
      console.log(`OK ${key} (${titles.length} steps)`);
    }
  }

  if (failures > 0) {
    process.exit(1);
  }
  console.log('Pathway program order checks passed.');
}

void main();
