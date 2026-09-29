/**
 * Builds data/pathway-videos.json from Supabase list_pathway_video_paths RPC.
 * Run: node scripts/generate-pathway-manifest.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outPath = path.join(root, 'data/pathway-videos.json');

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || 'https://soyaeuffzytrjojifvdz.supabase.co';
const SUPABASE_ANON =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNveWFldWZmenl0cmpvamlmdmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjk2MzYsImV4cCI6MjA5Njk0NTYzNn0.WmitCLz5piK5C4r4WJ5mHX50gRn-BOGFnPQH-bJZfCY';

const BUCKET = 'Oncosmart Videos and Assets';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

async function main() {
  const { data, error } = await supabase.rpc('list_pathway_video_paths');
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error('RPC did not return an array');

  const paths = data
    .filter((entry) => typeof entry === 'string' && entry.toLowerCase().endsWith('.mp4'))
    .sort((a, b) => a.localeCompare(b));

  const payload = {
    generatedAt: new Date().toISOString(),
    bucket: BUCKET,
    count: paths.length,
    paths,
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${paths.length} paths to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
