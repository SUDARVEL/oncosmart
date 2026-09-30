/**
 * Session-card landscape media from
 * `Oncosmart Videos and Assets/Oncosmart Phase II Landscape`.
 *
 * Prefer Phase II 1920×1080 assets; fall back to legacy landscape folders
 * only when Phase II has no match for that exercise.
 */

import type { ImageSource } from 'expo-image';

import type { AppAvatar, AppGender } from '../store/useAppStore';
import {
  PHASE2_FEMALE_LANDSCAPE_PHOTOS,
  PHASE2_FEMALE_LANDSCAPE_VIDEOS,
  PHASE2_LANDSCAPE_ROOT,
  PHASE2_MALE_LANDSCAPE_PHOTOS,
  PHASE2_MALE_LANDSCAPE_VIDEOS,
} from './phase2LandscapeAssets';

function isFemaleMediaTrack(
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): boolean {
  return avatar === 'female' || gender === 'female';
}

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const urlCache = new Map<string, string>();

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function publicUrlForObjectPath(objectPath: string): string {
  const cached = urlCache.get(objectPath);
  if (cached) return cached;
  const url = `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}`;
  urlCache.set(objectPath, url);
  return url;
}

/** Lookup keys for a pathway/catalog slug (aliases + left/right variants). */
function phase2SlugCandidates(exerciseId: string): string[] {
  const id = exerciseId.trim().toLowerCase();
  const base = id.replace(/-(left|right)$/i, '');
  const candidates = [id];
  if (base !== id) candidates.push(base);

  // Program diagram uses arm-rotation; Phase II storage uses arm-circles.
  if (base === 'arm-rotation') candidates.push('arm-circles');
  if (base === 'arm-circles') candidates.push('arm-rotation');

  // When the id has no side but assets are split left/right, try both.
  if (base === id) {
    candidates.push(`${base}-left`, `${base}-right`);
  }

  return [...new Set(candidates)];
}

function phase2RelPath(
  map: Partial<Record<string, string>>,
  exerciseId: string,
): string | null {
  for (const key of phase2SlugCandidates(exerciseId)) {
    const rel = map[key];
    if (rel) return rel;
  }
  return null;
}

export function getPhase2LandscapeVideoUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  const isFemale = isFemaleMediaTrack(gender, avatar);
  const rel = phase2RelPath(
    isFemale ? PHASE2_FEMALE_LANDSCAPE_VIDEOS : PHASE2_MALE_LANDSCAPE_VIDEOS,
    exerciseId,
  );
  if (!rel) return null;
  return publicUrlForObjectPath(`${PHASE2_LANDSCAPE_ROOT}/${rel}`);
}

export function getPhase2LandscapePhotoUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  const isFemale = isFemaleMediaTrack(gender, avatar);
  const rel = phase2RelPath(
    isFemale ? PHASE2_FEMALE_LANDSCAPE_PHOTOS : PHASE2_MALE_LANDSCAPE_PHOTOS,
    exerciseId,
  );
  if (!rel) return null;
  return publicUrlForObjectPath(`${PHASE2_LANDSCAPE_ROOT}/${rel}`);
}

export function resolvePhase2LandscapePhotoSource(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): ImageSource | null {
  const url = getPhase2LandscapePhotoUrl(exerciseId, gender, avatar);
  return url ? { uri: url } : null;
}

export type SessionCardLandscapePreview = {
  previewVideo: string | null;
  previewPhotoUrl: string | null;
  /** True when the chosen media came from Phase II Landscape. */
  fromPhase2: boolean;
};

/**
 * Resolve card media: Phase II video → Phase II photo → caller falls back to legacy.
 */
export function resolvePhase2CardLandscapePreview(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): SessionCardLandscapePreview {
  const previewVideo = getPhase2LandscapeVideoUrl(exerciseId, gender, avatar);
  const previewPhotoUrl = getPhase2LandscapePhotoUrl(exerciseId, gender, avatar);
  return {
    previewVideo,
    previewPhotoUrl,
    fromPhase2: Boolean(previewVideo || previewPhotoUrl),
  };
}
