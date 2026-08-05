import { getCompletedLevelsCount } from './programProgress';
import {
  asPauseReason,
  asProgressHoldType,
  asQuitReason,
  type ProgressHoldType,
} from './progressHold';
import { getSupabase } from './supabase';
import type {
  AgeRange,
  AppAvatar,
  AppGender,
  AppLanguage,
  TreatmentType,
} from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';

export type CloudLoadResult = {
  ok: boolean;
  onboardingComplete: boolean;
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

export function computeOnboardingComplete(state: {
  language: AppLanguage | null;
  username: string;
  gender: AppGender | null;
  avatar: AppAvatar | null;
  age: number | null;
  ageRange: AgeRange | null;
  parqCleared: boolean | null;
}): boolean {
  return Boolean(
    state.language &&
      state.username.trim() &&
      state.gender &&
      state.avatar &&
      (state.age != null || state.ageRange) &&
      state.parqCleared !== null,
  );
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
    .upsert(
      {
        user_id: userId,
        name: displayName,
      },
      { onConflict: 'user_id', ignoreDuplicates: false },
    )
    .select('id')
    .single();

  if (insertError) {
    console.warn('[CloudSync] ensurePatientRow insert failed', insertError.message);
    return null;
  }
  return (inserted?.id as string) ?? null;
}

/** Pull this auth user's cloud profile into the local Zustand store. */
export async function loadCloudProfileIntoStore(userId: string): Promise<CloudLoadResult> {
  const supabase = getSupabase();
  if (!supabase) {
    useAppStore.getState().setCloudProfileReady(true);
    return { ok: false, onboardingComplete: false };
  }

  useAppStore.getState().setActiveAuthUserId(userId);

  const patientId = await ensurePatientRow(userId);
  if (!patientId) {
    console.warn('[CloudSync] load aborted — could not ensure patient row');
    useAppStore.getState().setCloudProfileReady(true);
    return { ok: false, onboardingComplete: false };
  }

  const { data, error } = await supabase
    .from('patients')
    .select(
      'id,user_id,name,language,gender,avatar,age,age_range,cancer_type,treatment_undergoing,underwent_surgery,parq_answers,parq_cleared,progress_paused,progress_hold_type,pause_reason,quit_reason,pain_scores,day_completed_at,levels_completed,onboarding_complete,coach_tour_seen',
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[CloudSync] load failed', error.message);
    useAppStore.getState().setCloudProfileReady(true);
    return { ok: false, onboardingComplete: false };
  }
  if (!data) {
    useAppStore.getState().setCloudProfileReady(true);
    return { ok: false, onboardingComplete: false };
  }

  const onboardingComplete = Boolean(data.onboarding_complete);
  const dayCompletedAt = asRecordNumber(data.day_completed_at);
  const keptLanguage = useAppStore.getState().language;
  const hasCompletedAnyDay = Object.keys(dayCompletedAt).length > 0;

  // Fresh rows default parq_cleared=false; only treat as answered once onboarded.
  const parqCleared = onboardingComplete
    ? typeof data.parq_cleared === 'boolean'
      ? data.parq_cleared
      : true
    : null;

  const progressPaused = Boolean(data.progress_paused);
  let progressHoldType = asProgressHoldType(data.progress_hold_type);
  if (progressPaused && !progressHoldType) {
    // Legacy rows only had pause_reason / progress_paused.
    progressHoldType = data.quit_reason ? 'quit' : 'pause';
  }
  const pauseReason =
    progressPaused && progressHoldType === 'pause' ? asPauseReason(data.pause_reason) : null;
  const quitReason =
    progressPaused && progressHoldType === 'quit'
      ? asQuitReason(data.quit_reason) ?? asQuitReason(data.pause_reason)
      : null;

  useAppStore.getState().hydrateFromCloud({
    activeAuthUserId: userId,
    username: (data.name ?? '').trim(),
    language: (data.language as AppLanguage | null) ?? keptLanguage ?? null,
    gender: (data.gender as AppGender | null) ?? null,
    avatar: (data.avatar as AppAvatar | null) ?? null,
    age: typeof data.age === 'number' ? data.age : null,
    ageRange: (data.age_range as AgeRange | null) ?? null,
    cancerType: data.cancer_type ?? '',
    treatmentUndergoing: (data.treatment_undergoing as TreatmentType | null) ?? null,
    underwentSurgery:
      typeof data.underwent_surgery === 'boolean' ? data.underwent_surgery : null,
    parqAnswers: asParqAnswers(data.parq_answers),
    parqCleared,
    progressPaused,
    progressHoldType: progressPaused ? progressHoldType : null,
    pauseReason,
    quitReason,
    painScores: asRecordNumber(data.pain_scores),
    dayCompletedAt,
    levelsCompleted:
      typeof data.levels_completed === 'number'
        ? data.levels_completed
        : getCompletedLevelsCount(dayCompletedAt),
    // First-time onboarded users only; anyone with a completed day skips auto tips.
    coachTourSeen: data.coach_tour_seen === true || hasCompletedAnyDay,
  });

  return { ok: true, onboardingComplete };
}

/** Push current local store profile/progress to Supabase for this auth user. */
export async function saveCloudProfileFromStore(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const patientId = await ensurePatientRow(userId);
  if (!patientId) return false;

  const state = useAppStore.getState();
  const onboardingComplete = computeOnboardingComplete(state);
  const holdType: ProgressHoldType | null = state.progressPaused
    ? state.progressHoldType === 'quit'
      ? 'quit'
      : 'pause'
    : null;

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
      progress_hold_type: holdType,
      pause_reason: holdType === 'pause' ? state.pauseReason : null,
      quit_reason: holdType === 'quit' ? state.quitReason : null,
      ...(state.progressPaused
        ? {}
        : { paused_at: null, quit_at: null, progress_hold_type: null }),
      pain_scores: state.painScores,
      day_completed_at: state.dayCompletedAt,
      levels_completed: state.levelsCompleted,
      onboarding_complete: onboardingComplete,
      coach_tour_seen: state.coachTourSeen === true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', patientId);

  if (error) {
    console.warn('[CloudSync] save failed', error.message);
    return false;
  }

  // Stamp paused_at / quit_at once when newly holding (admin can see when).
  if (holdType === 'pause' && state.pauseReason) {
    const { error: pauseStampError } = await supabase
      .from('patients')
      .update({ paused_at: new Date().toISOString(), quit_at: null })
      .eq('id', patientId)
      .is('paused_at', null);
    if (pauseStampError) {
      console.warn('[CloudSync] paused_at stamp failed', pauseStampError.message);
    }
  }
  if (holdType === 'quit' && state.quitReason) {
    const { error: quitStampError } = await supabase
      .from('patients')
      .update({ quit_at: new Date().toISOString() })
      .eq('id', patientId)
      .is('quit_at', null);
    if (quitStampError) {
      console.warn('[CloudSync] quit_at stamp failed', quitStampError.message);
    }
  }

  return true;
}

/** Mark that this patient changed their password (admin sees status only). */
export async function markPasswordChanged(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const patientId = await ensurePatientRow(userId);
  if (!patientId) return;
  const { error } = await supabase
    .from('patients')
    .update({
      password_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', patientId);
  if (error) {
    console.warn('[CloudSync] password_changed_at save failed', error.message);
  }
}

/**
 * Persist one completed session + full progress snapshot.
 * Call after every day completion so logout never loses progress.
 */
export async function persistSessionProgress(params: {
  userId: string;
  level: number;
  dayInLevel: number;
  completedAt: number;
  painScore?: number;
}): Promise<void> {
  await upsertSessionCompletion(params);
  await saveCloudProfileFromStore(params.userId);
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
