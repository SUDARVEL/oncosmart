import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCompletedLevelsCount, sessionKey } from '../lib/programProgress';
import type { BadgeKey } from '../lib/getEarnedBadges';
import type { ProgressHoldType, PauseReason, QuitReason } from '../lib/progressHold';

export type AppLanguage = 'en' | 'ta';
export type AppGender = 'male' | 'female' | 'prefer_not_to_say';
export type AppAvatar = 'male' | 'female';
/** @deprecated Prefer numeric `age`. Kept for reading older persisted profiles. */
export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55-64';
export type TreatmentType = 'chemotherapy' | 'radiation' | 'both' | 'none';
export type { ProgressHoldType, PauseReason, QuitReason };

export type AppStateSnapshot = {
  language: AppLanguage | null;
  username: string;
  age: number | null;
  ageRange: AgeRange | null;
  gender: AppGender | null;
  cancerType: string;
  treatmentUndergoing: TreatmentType | null;
  underwentSurgery: boolean | null;
  avatar: AppAvatar | null;
  parqAnswers: (boolean | null)[];
  parqCleared: boolean | null;
  painScores: Record<string, number>;
  progressPaused: boolean;
  /** pause = temporary hold, quit = stopped the program. */
  progressHoldType: ProgressHoldType | null;
  /** Why progress was paused (Growth → Pause Progress). */
  pauseReason: PauseReason | null;
  /** Why the patient quit mid-exercise (Why did you stop?). */
  quitReason: QuitReason | null;
  /** Start/end BPM captured per session key (L1D1, etc.) before cloud sync. */
  sessionBpmByKey: Record<string, { startBpm: number; endBpm: number }>;
  levelsCompleted: number;
  dayCompletedAt: Record<string, number>;
  activeAuthUserId: string | null;
  /** True after the patient finishes or skips the first-run coach tour. */
  coachTourSeen: boolean;
};

type CloudHydrateInput = Partial<AppStateSnapshot>;

type AppState = AppStateSnapshot & {
  /** Dev-only flag that bypasses the 12h unlock delay between days. */
  devUnlockOverride: boolean;
  /** Ephemeral queue of badge celebrations to show after a session. */
  pendingBadgeCelebrations: BadgeKey[];
  /**
   * Active coach-tour step index, or null when the tour is idle.
   * Ephemeral (not persisted) so a cold start doesn't reopen mid-tour.
   */
  coachTourStep: number | null;
  /**
   * True after the first cloud profile load attempt for the signed-in user.
   * Ephemeral — prevents the first-run coach tour from racing ahead of cloud data.
   */
  cloudProfileReady: boolean;
  setLanguage: (language: AppLanguage) => void;
  setUsername: (username: string) => void;
  setAge: (age: number) => void;
  setAgeRange: (ageRange: AgeRange) => void;
  setGender: (gender: AppGender) => void;
  setCancerType: (cancerType: string) => void;
  setTreatmentUndergoing: (treatment: TreatmentType) => void;
  setUnderwentSurgery: (value: boolean) => void;
  setAvatar: (avatar: AppAvatar) => void;
  setParqAnswer: (index: number, value: boolean) => void;
  setParqCleared: (cleared: boolean) => void;
  setPainScore: (level: number, dayInLevel: number, score: number) => void;
  /**
   * Freeze or unfreeze progress.
   * When holding, pass `holdType` (`pause` | `quit`) plus a reason.
   * When resuming, call with `paused: false`.
   */
  setProgressPaused: (
    paused: boolean,
    reason?: PauseReason | QuitReason | null,
    holdType?: ProgressHoldType | null,
  ) => void;
  /** Record mid-exercise quit without pausing program progress. */
  recordExerciseQuit: (reason: QuitReason) => void;
  setSessionBpm: (
    key: string,
    data: { startBpm: number; endBpm?: number },
  ) => void;
  setLevelsCompleted: (count: number) => void;
  setActiveAuthUserId: (userId: string | null) => void;
  setCoachTourSeen: (seen: boolean) => void;
  setCoachTourStep: (step: number | null) => void;
  setCloudProfileReady: (ready: boolean) => void;
  /** Restart the product tour from step 0 (Settings → Replay tips). */
  restartCoachTour: () => void;
  /** Replace local profile/progress with cloud data for the signed-in user. */
  hydrateFromCloud: (payload: CloudHydrateInput) => void;
  /** Merge start/end BPM loaded from exercise_completions (cloud wins when valid). */
  mergeSessionBpmFromCloud: (
    entries: Record<string, { startBpm: number; endBpm: number }>,
  ) => void;
  /** Record a session completion (level + day within level). */
  markSessionCompleted: (level: number, dayInLevel: number, when?: number) => void;
  /** @deprecated Use markSessionCompleted */
  markDayCompleted: (day: number, when?: number) => void;
  setDevUnlockOverride: (value: boolean) => void;
  enqueueBadgeCelebrations: (badges: BadgeKey[]) => void;
  dismissBadgeCelebration: () => void;
  /** Dev-only: wipe day progress without touching onboarding profile. */
  devResetProgress: () => void;
  /** Clear local session cache (logout). Cloud rows stay for next login. */
  resetApp: () => void;
};

const INITIAL_PARQ_ANSWERS: (boolean | null)[] = Array(7).fill(null);

/** Prefer the newer completion timestamp per session key when merging local + cloud. */
function mergeDayCompletedAt(
  local: Record<string, number>,
  cloud?: Record<string, number>,
): Record<string, number> {
  const merged = { ...local };
  if (!cloud) return merged;
  for (const [key, at] of Object.entries(cloud)) {
    const existing = merged[key];
    if (existing == null || at > existing) merged[key] = at;
  }
  return merged;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: null,
      username: '',
      age: null,
      ageRange: null,
      gender: null,
      cancerType: '',
      treatmentUndergoing: null,
      underwentSurgery: null,
      avatar: null,
      parqAnswers: [...INITIAL_PARQ_ANSWERS],
      parqCleared: null,
      painScores: {},
      progressPaused: false,
      progressHoldType: null,
      pauseReason: null,
      quitReason: null,
      sessionBpmByKey: {},
      levelsCompleted: 0,
      dayCompletedAt: {},
      activeAuthUserId: null,
      coachTourSeen: false,
      coachTourStep: null,
      cloudProfileReady: false,
      devUnlockOverride: false,
      pendingBadgeCelebrations: [],
      setLanguage: (language) => set({ language }),
      setUsername: (username) => set({ username }),
      setAge: (age) => set({ age, ageRange: null }),
      setAgeRange: (ageRange) => set({ ageRange }),
      setGender: (gender) => set({ gender }),
      setCancerType: (cancerType) => set({ cancerType }),
      setTreatmentUndergoing: (treatmentUndergoing) => set({ treatmentUndergoing }),
      setUnderwentSurgery: (underwentSurgery) => set({ underwentSurgery }),
      setAvatar: (avatar) => set({ avatar }),
      setParqAnswer: (index, value) =>
        set((state) => {
          const next = [...state.parqAnswers];
          next[index] = value;
          return { parqAnswers: next };
        }),
      setParqCleared: (cleared) => set({ parqCleared: cleared }),
      setPainScore: (level, dayInLevel, score) =>
        set((state) => {
          if (state.progressPaused) return state;
          return {
            painScores: { ...state.painScores, [`${level}:${dayInLevel}`]: score },
          };
        }),
      setProgressPaused: (paused, reason = null, holdType = null) =>
        set((state) => {
          if (!paused) {
            return {
              progressPaused: false,
              progressHoldType: null,
              pauseReason: null,
            };
          }
          // Growth → Pause Progress only. Mid-exercise quit uses recordExerciseQuit().
          if (holdType === 'quit') {
            return state;
          }
          return {
            progressPaused: true,
            progressHoldType: 'pause',
            pauseReason: (reason as PauseReason | null) ?? null,
          };
        }),
      recordExerciseQuit: (reason) =>
        set({
          quitReason: reason,
        }),
      setSessionBpm: (key, data) =>
        set((state) => {
          const existing = state.sessionBpmByKey[key];
          return {
            sessionBpmByKey: {
              ...state.sessionBpmByKey,
              [key]: {
                startBpm: data.startBpm ?? existing?.startBpm ?? 0,
                endBpm: data.endBpm ?? existing?.endBpm ?? 0,
              },
            },
          };
        }),
      setLevelsCompleted: (count) => set({ levelsCompleted: count }),
      setActiveAuthUserId: (userId) => set({ activeAuthUserId: userId }),
      setCoachTourSeen: (seen) => set({ coachTourSeen: Boolean(seen) }),
      setCoachTourStep: (step) =>
        set({
          coachTourStep:
            step == null || !Number.isFinite(step) ? null : Math.max(0, Math.floor(step)),
        }),
      setCloudProfileReady: (ready) => set({ cloudProfileReady: Boolean(ready) }),
      restartCoachTour: () => set({ coachTourSeen: false, coachTourStep: 0 }),
      hydrateFromCloud: (payload) =>
        set((state) => {
          const dayCompletedAt = mergeDayCompletedAt(
            state.dayCompletedAt,
            payload.dayCompletedAt,
          );
          const hasCompletedAnyDay = Object.keys(dayCompletedAt).length > 0;
          // Cloud + local OR any completed day ⇒ never auto-show first-run tips again.
          // Settings → Replay tips still works via restartCoachTour().
          const coachTourSeen =
            payload.coachTourSeen === true ||
            state.coachTourSeen === true ||
            hasCompletedAnyDay;
          return {
            ...state,
            ...payload,
            coachTourSeen,
            cloudProfileReady: true,
            parqAnswers: payload.parqAnswers
              ? [...payload.parqAnswers]
              : state.parqAnswers,
            painScores: payload.painScores
              ? { ...payload.painScores }
              : state.painScores,
            dayCompletedAt,
            levelsCompleted: getCompletedLevelsCount(dayCompletedAt),
          };
        }),
      mergeSessionBpmFromCloud: (entries) =>
        set((state) => {
          const sessionBpmByKey = { ...state.sessionBpmByKey };
          for (const [key, bpm] of Object.entries(entries)) {
            if (bpm.startBpm > 0 && bpm.endBpm > 0) {
              sessionBpmByKey[key] = bpm;
            }
          }
          return { sessionBpmByKey };
        }),
      markSessionCompleted: (level, dayInLevel, when) =>
        set((state) => {
          // Pause Progress freezes program advancement for every avatar/gender.
          if (state.progressPaused) return state;
          const key = sessionKey(level, dayInLevel);
          if (state.dayCompletedAt[key] && when == null) {
            return state;
          }
          const dayCompletedAt = { ...state.dayCompletedAt, [key]: when ?? Date.now() };
          return {
            dayCompletedAt,
            levelsCompleted: getCompletedLevelsCount(dayCompletedAt),
          };
        }),
      markDayCompleted: (day, when) =>
        set((state) => {
          if (state.progressPaused) return state;
          const key = sessionKey(1, day);
          if (state.dayCompletedAt[key] && when == null) {
            return state;
          }
          const dayCompletedAt = { ...state.dayCompletedAt, [key]: when ?? Date.now() };
          return {
            dayCompletedAt,
            levelsCompleted: getCompletedLevelsCount(dayCompletedAt),
          };
        }),
      setDevUnlockOverride: (value) => set({ devUnlockOverride: value }),
      enqueueBadgeCelebrations: (badges) =>
        set((state) => {
          if (badges.length === 0) return state;
          const existing = new Set(state.pendingBadgeCelebrations);
          const next = [...state.pendingBadgeCelebrations];
          for (const badge of badges) {
            if (!existing.has(badge)) {
              existing.add(badge);
              next.push(badge);
            }
          }
          return { pendingBadgeCelebrations: next };
        }),
      dismissBadgeCelebration: () =>
        set((state) => ({
          pendingBadgeCelebrations: state.pendingBadgeCelebrations.slice(1),
        })),
      devResetProgress: () =>
        set({
          dayCompletedAt: {},
          levelsCompleted: 0,
          devUnlockOverride: false,
          painScores: {},
          sessionBpmByKey: {},
          pendingBadgeCelebrations: [],
        }),
      resetApp: () =>
        set({
          language: null,
          username: '',
          age: null,
          ageRange: null,
          gender: null,
          cancerType: '',
          treatmentUndergoing: null,
          underwentSurgery: null,
          avatar: null,
          parqAnswers: [...INITIAL_PARQ_ANSWERS],
          parqCleared: null,
          painScores: {},
          progressPaused: false,
          progressHoldType: null,
          pauseReason: null,
          quitReason: null,
          sessionBpmByKey: {},
          levelsCompleted: 0,
          dayCompletedAt: {},
          activeAuthUserId: null,
          coachTourSeen: false,
          coachTourStep: null,
          cloudProfileReady: false,
          devUnlockOverride: false,
          pendingBadgeCelebrations: [],
        }),
    }),
    {
      // Bumped so older APK local profiles (saved name/progress) are not reused.
      name: 'oncofitness-app-v9',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist progress while a user is signed in locally. Language is also
      // stored separately in preferredLanguage for the pre-login gate.
      partialize: (state) => ({
        language: state.language,
        username: state.username,
        age: state.age,
        ageRange: state.ageRange,
        gender: state.gender,
        cancerType: state.cancerType,
        treatmentUndergoing: state.treatmentUndergoing,
        underwentSurgery: state.underwentSurgery,
        avatar: state.avatar,
        parqAnswers: state.parqAnswers,
        parqCleared: state.parqCleared,
        painScores: state.painScores,
        progressPaused: state.progressPaused,
        progressHoldType: state.progressHoldType,
        pauseReason: state.pauseReason,
        quitReason: state.quitReason,
        levelsCompleted: state.levelsCompleted,
        dayCompletedAt: state.dayCompletedAt,
        sessionBpmByKey: state.sessionBpmByKey,
        activeAuthUserId: state.activeAuthUserId,
        coachTourSeen: state.coachTourSeen,
        devUnlockOverride: state.devUnlockOverride,
      }),
    },
  ),
);
