import { getCompletedLevelsCount } from './programProgress';
import { getSupabase } from './supabase';
import type {
  AgeRange,
  AppAvatar,
  AppGender,
  AppLanguage,
  TreatmentType,
} from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';

export type CloudPatientRow = {
  id: string;
  user_id: string;
  name: string;
  language: AppLanguage | null;
  gender: AppGender | null;
  avatar: AppAvatar | null;
  age: number | null;
  age_range: AgeRange | null;
  cancer_type: string | null;
  treatment_undergoing: TreatmentType | null;
  underwent_surgery: boolean | null;
  parq_answers: (boolean | null)[] | null;
  parq_cleared: boolean | null;
  progress_paused: boolean | null;
  pain_scores: Record<string, number> | null;
  day_completed_at: Record<string, number> | null;
  levels_completed: number | null;
  onboarding_complete: boolean | null;
};

function asRecordNumber(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (Number.isFinite(n)) out[key] = n;
  }
  return out;
}

function asParqAnswers(value: unknown): (boolean | null)[] {
  if (!Array.isArray(value)) return Array(7).fill(null);
  const next = value.slice(0, 7).map((v) => (typeof v === 'boolean' ? v : null));
  while (next.length < 7) next.push(null);
  return next;
}

/** Ensure a patients row exists for the signed-in auth user. */
export async function ensurePatientRow(userId: string, displayName = ''): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: existing, error: selectError } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (selectError) {
    console.warn('[CloudSync] ensurePatientRow select failed', selectError.message);
    return null;
  }
  if (existing?.id) return existing.id as string;

  const { data: inserted, error: insertError } = await supabase
    .from('patients')
    .insert({
      user_id: userId,
      name: displayName,
    })
    .select('id')
    .single();

  if (insertError) {
    console.warn('[CloudSync] ensurePatientRow insert failed', insertError.message);
    return null;
  }
  return (inserted?.id as string) ?? null;
}

/** Pull this auth user's cloud profile into the local Zustand store. */
export async function loadCloudProfileIntoStore(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  await ensurePatientRow(userId);

  const { data, error } = await supabase
    .from('patients')
    .select(
      'id,user_id,name,language,gender,avatar,age,age_range,cancer_type,treatment_undergoing,underwent_surgery,parq_answers,parq_cleared,progress_paused,pain_scores,day_completed_at,levels_completed,onboarding_complete',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[CloudSync] load failed', error.message);
    return false;
  }
  if (!data) return false;

  const dayCompletedAt = asRecordNumber(data.day_completed_at);
  useAppStore.getState().hydrateFromCloud({
    activeAuthUserId: userId,
    username: data.name ?? '',
    language: (data.language as AppLanguage | null) ?? null,
    gender: (data.gender as AppGender | null) ?? null,
    avatar: (data.avatar as AppAvatar | null) ?? null,
    age: typeof data.age === 'number' ? data.age : null,
    ageRange: (data.age_range as AgeRange | null) ?? null,
    cancerType: data.cancer_type ?? '',
    treatmentUndergoing: (data.treatment_undergoing as TreatmentType | null) ?? null,
    underwentSurgery:
      typeof data.underwent_surgery === 'boolean' ? data.underwent_surgery : null,
    parqAnswers: asParqAnswers(data.parq_answers),
    parqCleared: typeof data.parq_cleared === 'boolean' ? data.parq_cleared : null,
    progressPaused: Boolean(data.progress_paused),
    painScores: asRecordNumber(data.pain_scores),
    dayCompletedAt,
    levelsCompleted:
      typeof data.levels_completed === 'number'
        ? data.levels_completed
        : getCompletedLevelsCount(dayCompletedAt),
  });

  return true;
}

/** Push current local store profile/progress to Supabase for this auth user. */
export async function saveCloudProfileFromStore(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const patientId = await ensurePatientRow(userId);
  if (!patientId) return false;

  const state = useAppStore.getState();
  const onboardingComplete = Boolean(
    state.language &&
      state.username.trim() &&
      state.gender &&
      state.avatar &&
      (state.age != null || state.ageRange) &&
      state.parqCleared !== null,
  );

  const { error } = await supabase
    .from('patients')
    .update({
      name: state.username.trim(),
      language: state.language,
      gender: state.gender,
      avatar: state.avatar,
      age: state.age,
      age_range: state.ageRange,
      cancer_type: state.cancerType,
      treatment_undergoing: state.treatmentUndergoing,
      underwent_surgery: state.underwentSurgery,
      parq_answers: state.parqAnswers,
      parq_cleared: state.parqCleared,
      progress_paused: state.progressPaused,
      pain_scores: state.painScores,
      day_completed_at: state.dayCompletedAt,
      levels_completed: state.levelsCompleted,
      onboarding_complete: onboardingComplete,
    })
    .eq('id', patientId);

  if (error) {
    console.warn('[CloudSync] save failed', error.message);
    return false;
  }
  return true;
}

/** Upsert one completed session row (best-effort; patients JSON is source of truth). */
export async function upsertSessionCompletion(params: {
  userId: string;
  level: number;
  dayInLevel: number;
  completedAt: number;
  painScore?: number;
}): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const patientId = await ensurePatientRow(params.userId);
  if (!patientId) return;

  const sessionKey = `L${params.level}D${params.dayInLevel}`;
  const { error } = await supabase.from('exercise_completions').upsert(
    {
      patient_id: patientId,
      day: params.dayInLevel,
      level: params.level,
      day_in_level: params.dayInLevel,
      session_key: sessionKey,
      completed_at: new Date(params.completedAt).toISOString(),
      pain_score: params.painScore ?? null,
    },
    { onConflict: 'patient_id,session_key' },
  );
  if (error) {
    console.warn('[CloudSync] completion upsert failed', error.message);
  }
}
