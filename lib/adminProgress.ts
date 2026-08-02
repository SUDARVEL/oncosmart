import { getSupabase } from './supabase';
import {
  DAYS_PER_LEVEL,
  TOTAL_SESSIONS,
  getActiveLevel,
  getCompletedSessionCount,
  parseSessionKey,
  sessionKey,
} from './programProgress';

export type AdminPatientProgress = {
  userId: string;
  accountEmail: string;
  accountUsername: string;
  patientId: string | null;
  displayName: string;
  language: string | null;
  gender: string | null;
  age: number | null;
  cancerType: string;
  onboardingComplete: boolean;
  progressPaused: boolean;
  levelsCompleted: number;
  dayCompletedAt: Record<string, number>;
  painScores: Record<string, number>;
  sessionsCompleted: number;
  activeLevel: number;
  activeDayInLevel: number | null;
  updatedAt: string | null;
  createdAt: string | null;
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

function nextOpenDay(completions: Record<string, number>): number | null {
  const level = getActiveLevel(completions);
  for (let day = 1; day <= DAYS_PER_LEVEL; day += 1) {
    if (!completions[sessionKey(level, day)]) return day;
  }
  return null;
}

type RpcRow = {
  user_id: string;
  account_email: string;
  account_username: string;
  patient_id: string | null;
  display_name: string;
  language: string | null;
  gender: string | null;
  age: number | null;
  cancer_type: string | null;
  onboarding_complete: boolean | null;
  progress_paused: boolean | null;
  levels_completed: number | null;
  day_completed_at: Record<string, number> | null;
  pain_scores: Record<string, number> | null;
  sessions_completed: number | null;
  updated_at: string | null;
  created_at: string | null;
};

/** Fetch all patient accounts + progress for the signed-in admin. */
export async function fetchAdminPatientProgress(): Promise<AdminPatientProgress[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc('admin_list_patient_progress');
  if (error) {
    console.warn('[Admin] list progress failed', error.message);
    return [];
  }

  const rows = (data ?? []) as RpcRow[];
  return rows.map((row) => {
    const dayCompletedAt = asRecordNumber(row.day_completed_at);
    const sessionsCompleted =
      typeof row.sessions_completed === 'number'
        ? row.sessions_completed
        : getCompletedSessionCount(dayCompletedAt);
    const activeLevel = getActiveLevel(dayCompletedAt);
    return {
      userId: row.user_id,
      accountEmail: row.account_email,
      accountUsername: row.account_username,
      patientId: row.patient_id,
      displayName: row.display_name || row.account_username,
      language: row.language,
      gender: row.gender,
      age: typeof row.age === 'number' ? row.age : null,
      cancerType: row.cancer_type ?? '',
      onboardingComplete: Boolean(row.onboarding_complete),
      progressPaused: Boolean(row.progress_paused),
      levelsCompleted: typeof row.levels_completed === 'number' ? row.levels_completed : 0,
      dayCompletedAt,
      painScores: asRecordNumber(row.pain_scores),
      sessionsCompleted,
      activeLevel,
      activeDayInLevel: sessionsCompleted >= TOTAL_SESSIONS ? null : nextOpenDay(dayCompletedAt),
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  });
}

export function sortedCompletedSessions(
  dayCompletedAt: Record<string, number>,
): { key: string; level: number; dayInLevel: number; completedAt: number }[] {
  return Object.entries(dayCompletedAt)
    .map(([key, completedAt]) => {
      const parsed = parseSessionKey(key);
      if (!parsed || !Number.isFinite(completedAt)) return null;
      return { key, level: parsed.level, dayInLevel: parsed.dayInLevel, completedAt };
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .sort((a, b) => a.level - b.level || a.dayInLevel - b.dayInLevel);
}

export { TOTAL_SESSIONS };
