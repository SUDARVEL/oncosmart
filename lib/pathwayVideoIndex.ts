import { getSupabase } from './supabase';
import {
  cancerPathMatchesSlug,
  getPathwayStorageRoot,
  parseLevelFromStoragePath,
  type CancerTypeSlug,
  type PathwayProfile,
} from './cancerPathway';
import { comparePathwayFiles, parsePathwayFilename } from './pathwayFilenameParser';
import { resolvePathwayExerciseCopy } from './pathwayExerciseContent';
import type { GuidedSessionExercise } from './getDay1Session';
import { getPublicVideoUrl } from './supabaseStorage';

const REST_SECONDS = 20;

let cachedPaths: string[] | null = null;
let loadPromise: Promise<string[]> | null = null;

async function fetchPathwayPathsFromSupabase(): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc('list_pathway_video_paths');
  if (error) {
    console.warn('[PathwayVideoIndex] RPC failed', error.message);
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data.filter((entry): entry is string => typeof entry === 'string');
}

export async function ensurePathwayVideoPathsLoaded(): Promise<string[]> {
  if (cachedPaths) return cachedPaths;
  if (!loadPromise) {
    loadPromise = fetchPathwayPathsFromSupabase().then((paths) => {
      cachedPaths = paths;
      return paths;
    });
  }
  return loadPromise;
}

export function clearPathwayVideoCache(): void {
  cachedPaths = null;
  loadPromise = null;
}

function objectPathsForProfileLevel(
  paths: string[],
  profile: PathwayProfile,
  level: number,
): string[] {
  const root = getPathwayStorageRoot(profile.gender, profile.avatar, profile.language);
  const prefix = `${root}/`;

  return paths.filter((objectPath) => {
    if (!objectPath.startsWith(prefix)) return false;
    const segments = objectPath.split('/');
    const cancerFolder = segments[1] ?? '';
    if (!cancerPathMatchesSlug(cancerFolder, profile.cancerType)) return false;
    const parsedLevel = parseLevelFromStoragePath(objectPath);
    return parsedLevel === level;
  });
}

export function buildGuidedExercisesFromPaths(
  objectPaths: string[],
  level: number,
  profile: PathwayProfile,
): GuidedSessionExercise[] {
  const parsed = objectPaths.map((objectPath) => {
    const fileName = objectPath.split('/').pop() ?? objectPath;
    const fileMeta = parsePathwayFilename(fileName);
    const copy = resolvePathwayExerciseCopy(fileMeta.rawLabel);
    const publicUrl = getPublicVideoUrl(objectPath) ?? '';
    const stepIndex = 0; // filled after sort

    return {
      objectPath,
      fileMeta,
      copy,
      publicUrl,
      stepIndex,
    };
  });

  parsed.sort((a, b) => comparePathwayFiles(a.fileMeta, b.fileMeta));

  return parsed.map((entry, index) => ({
    id: `pathway-${profile.cancerType}-L${level}-s${index}-${entry.copy.slug}`,
    title: entry.copy.title,
    description: entry.copy.description,
    storageObjectPath: entry.objectPath,
    videoUrl: entry.publicUrl,
    repType: entry.fileMeta.repType,
    repValue: entry.fileMeta.repValue,
    displayValue: entry.fileMeta.displayValue,
    displayLabel: entry.fileMeta.displayLabel,
    portraitVideo: entry.objectPath,
  }));
}

export async function getPathwaySessionExercises(
  profile: PathwayProfile,
  level: number,
): Promise<GuidedSessionExercise[]> {
  const paths = await ensurePathwayVideoPathsLoaded();
  const levelPaths = objectPathsForProfileLevel(paths, profile, level);
  return buildGuidedExercisesFromPaths(levelPaths, level, profile);
}

export function getPathwaySessionRestSeconds(): number {
  return REST_SECONDS;
}
