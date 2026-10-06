import type { AppAvatar, AppGender, AppLanguage } from '../store/useAppStore';

/** Stored in profile + Supabase `cancer_type`. */
export type CancerTypeSlug = 'breast' | 'thorax' | 'abdomen' | 'head-neck';

export const CANCER_TYPE_SLUGS: readonly CancerTypeSlug[] = [
  'breast',
  'thorax',
  'abdomen',
  'head-neck',
] as const;

export type PathwayProfile = {
  gender: AppGender | null;
  avatar: AppAvatar | null;
  language: AppLanguage | null;
  cancerType: CancerTypeSlug;
};

export function resolveMediaGender(
  gender: AppGender | null,
  avatar: AppAvatar | null,
): 'male' | 'female' {
  if (avatar === 'female' || gender === 'female') return 'female';
  if (avatar === 'male' || gender === 'male') return 'male';
  return 'male';
}

/** Supabase root folder: `Male - English`, etc. */
export function getPathwayStorageRoot(
  gender: AppGender | null,
  avatar: AppAvatar | null,
  language: AppLanguage | null,
): string {
  const mediaGender = resolveMediaGender(gender, avatar);
  const langLabel = language === 'ta' ? 'Tamil' : 'English';
  return `${mediaGender === 'female' ? 'Female' : 'Male'} - ${langLabel}`;
}

export function normalizeCancerTypeSlug(raw: string | null | undefined): CancerTypeSlug | null {
  const value = (raw ?? '').trim().toLowerCase();
  if (!value) return null;
  if (value === 'breast' || value.includes('breast')) return 'breast';
  if (value === 'thorax' || value.includes('thorax') || value.includes('thoracic')) return 'thorax';
  if (value === 'abdomen' || value.includes('abdomen') || value.includes('abdominal')) return 'abdomen';
  if (
    value === 'head-neck' ||
    value.includes('head and neck') ||
    value.includes('head & neck') ||
    value.includes('head-neck')
  ) {
    return 'head-neck';
  }
  return null;
}

/** Match storage cancer folder segment (handles typos / naming quirks). */
export function cancerPathMatchesSlug(cancerFolderSegment: string, slug: CancerTypeSlug): boolean {
  const lower = cancerFolderSegment.toLowerCase();
  switch (slug) {
    case 'breast':
      return lower.includes('breast');
    case 'abdomen':
      return lower.includes('abdomen');
    case 'head-neck':
      return lower.includes('head') && lower.includes('neck');
    case 'thorax':
      return lower.includes('thorax');
    default:
      return false;
  }
}

export function parseLevelFromStoragePath(objectPath: string): number | null {
  const match = /\/Level\s*(\d+)/i.exec(objectPath);
  if (!match) return null;
  const level = Number(match[1]);
  return Number.isFinite(level) && level >= 1 && level <= 4 ? level : null;
}

/**
 * Illustrations in Supabase `Oximeter info`.
 * The thorax file is portrait, with the circular artwork inset, so it is
 * scaled to fill the same circle as the square icons.
 */
export const CANCER_TYPE_ART: Record<CancerTypeSlug, { path: string; scale: number }> = {
  breast: { path: 'Oximeter info/Breast Cancer 2.png', scale: 1 },
  thorax: { path: 'Oximeter info/Thoracic Cancer Illustrations.png', scale: 1.24 },
  abdomen: { path: 'Oximeter info/Abdomen Cancer illustration2.png', scale: 1 },
  'head-neck': { path: 'Oximeter info/Head & Neck pathway illustrations.png', scale: 1 },
};

export const CANCER_TYPE_I18N_KEYS: Record<CancerTypeSlug, string> = {
  breast: 'treatment.cancerTypeBreast',
  thorax: 'treatment.cancerTypeThorax',
  abdomen: 'treatment.cancerTypeAbdomen',
  'head-neck': 'treatment.cancerTypeHeadNeck',
};

export function formatCancerTypeForDisplay(
  raw: string | null | undefined,
  translate: (key: string) => string,
): string {
  const slug = normalizeCancerTypeSlug(raw);
  if (slug) return translate(CANCER_TYPE_I18N_KEYS[slug]);
  const trimmed = (raw ?? '').trim();
  return trimmed.length > 0 ? trimmed : translate('admin.pauseReasonNone');
}
