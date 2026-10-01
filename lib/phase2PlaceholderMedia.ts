/**
 * Portrait stills from
 * `Oncosmart Videos and Assets/Placeholders Oncomsart Phase 2`.
 *
 * Growth row circles use only this folder. Every file is 9:16, so the 66×70
 * circle uses contain and keeps that ratio. Cot / lying poses sit in the
 * lower third of the frame.
 */

import type { ImageContentPosition } from 'expo-image';

import type { AppAvatar, AppGender } from '../store/useAppStore';
import {
  PHASE2_FEMALE_PLACEHOLDERS,
  PHASE2_MALE_PLACEHOLDERS,
  PHASE2_PLACEHOLDER_ROOT,
} from './phase2PlaceholderAssets';

const SUPABASE_PUBLIC_BASE =
  'https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets';

const urlCache = new Map<string, string>();

/** Subject lives in the lower third of the 9:16 frame (cot / lying). */
const LOW_POSES = new Set([
  'ankle-pumps',
  'hamstring-stretch',
  'straight-leg-raise',
]);

function isFemaleMediaTrack(
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): boolean {
  return avatar === 'female' || gender === 'female';
}

export function exerciseSlugFromId(exerciseId: string): string {
  const match = /-s\d+-(.+)$/i.exec(exerciseId.trim());
  return (match?.[1] ?? exerciseId).trim().toLowerCase();
}

function slugCandidates(exerciseId: string): string[] {
  const id = exerciseSlugFromId(exerciseId);
  const base = id.replace(/-(left|right)$/i, '');
  const candidates = [id];
  if (base !== id) candidates.push(base);
  if (base === 'arm-rotation') candidates.push('arm-circles');
  if (base === 'arm-circles') candidates.push('arm-rotation');
  if (base === id) candidates.push(`${base}-left`, `${base}-right`);
  return [...new Set(candidates)];
}

function encodeObjectPath(objectPath: string): string {
  return objectPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function getPhase2PlaceholderObjectPath(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  const map = isFemaleMediaTrack(gender, avatar)
    ? PHASE2_FEMALE_PLACEHOLDERS
    : PHASE2_MALE_PLACEHOLDERS;
  const root = `${PHASE2_PLACEHOLDER_ROOT}/`;
  for (const key of slugCandidates(exerciseId)) {
    const path = map[key];
    if (path?.startsWith(root)) return path;
  }
  return null;
}

export function getPhase2PlaceholderUrl(
  exerciseId: string,
  gender: AppGender | null,
  avatar: AppAvatar | null = null,
): string | null {
  const objectPath = getPhase2PlaceholderObjectPath(exerciseId, gender, avatar);
  if (!objectPath) return null;
  const cached = urlCache.get(objectPath);
  if (cached) return cached;
  const url = `${SUPABASE_PUBLIC_BASE}/${encodeObjectPath(objectPath)}`;
  urlCache.set(objectPath, url);
  return url;
}

export function isPhase2PlaceholderUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  return uri.includes('Placeholders%20Oncomsart%20Phase%202') || uri.includes('Placeholders Oncomsart Phase 2');
}

/**
 * 66×70 circle uses contain, so this only shifts leftover space.
 * Low cot poses stay bottom-aligned inside the 9:16 frame.
 */
export function getPhase2CircleContentPosition(
  exerciseId: string,
): ImageContentPosition {
  const base = exerciseSlugFromId(exerciseId).replace(/-(left|right)$/i, '');
  if (LOW_POSES.has(base)) return 'bottom';
  return 'center';
}
