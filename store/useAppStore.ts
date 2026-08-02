import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCompletedLevelsCount, sessionKey } from '../lib/programProgress';
import type { BadgeKey } from '../lib/getEarnedBadges';

export type AppLanguage = 'en' | 'ta';
export type AppGender = 'male' | 'female' | 'prefer_not_to_say';
export type AppAvatar = 'male' | 'female';
/** @deprecated Prefer numeric `age`. Kept for reading older persisted profiles. */
export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55-64';
export type TreatmentType = 'chemotherapy' | 'radiation' | 'both' | 'none';

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
  levelsCompleted: number;
  dayCompletedAt: Record<string, number>;
  activeAuthUserId: string | null;
  /** True after the patient finishes or skips the first-run coach tour. */
  coachTourSeen: boolean;
};

type CloudHydrateInput = Partial<AppStateSnapshot>;

type AppState = AppStateSnapshot & {
  /** Dev-only flag that bypasses the 24h unlock delay between days. */
  devUnlockOverride: boolean;
  /** Ephemeral queue of badge celebrations to show after a session. */
  pendingBadgeCelebrations: BadgeKey[];
  /**
   * Active coach-tour step index, or null when the tour is idle.
   * Ephemeral (not persisted) so a cold start doesn't reopen mid-tour.
   */
  coachTourStep: number | null;
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
  setProgressPaused: (paused: boolean) => void;
  setLevelsCompleted: (count: number) => void;
  setActiveAuthUserId: (userId: string | null) => void;
  setCoachTourSeen: (seen: boolean) => void;
  setCoachTourStep: (step: number | null) => void;
  /** Restart the product tour from step 0 (Settings → Replay tips). */
  restartCoachTour: () => void;
  /** Replace local profile/progress with cloud data for the signed-in user. */
  hydrateFromCloud: (payload: CloudHydrateInput) => void;
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
      levelsCompleted: 0,
      dayCompletedAt: {},
      activeAuthUserId: null,
      coachTourSeen: false,
      coachTourStep: null,
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
      setProgressPaused: (paused) => set({ progressPaused: paused }),
      setLevelsCompleted: (count) => set({ levelsCompleted: count }),
      setActiveAuthUserId: (userId) => set({ activeAuthUserId: userId }),
      setCoachTourSeen: (seen) => set({ coachTourSeen: Boolean(seen) }),
      setCoachTourStep: (step) =>
        set({
          coachTourStep:
            step == null || !Number.isFinite(step) ? null : Math.max(0, Math.floor(step)),
        }),
      restartCoachTour: () => set({ coachTourSeen: false, coachTourStep: 0 }),
      hydrateFromCloud: (payload) =>
        set((state) => ({
          ...state,
          ...payload,
          // Never overwrite local tour completion from cloud profile blobs.
          coachTourSeen: state.coachTourSeen === true,
          parqAnswers: payload.parqAnswers
            ? [...payload.parqAnswers]
            : state.parqAnswers,
          painScores: payload.painScores
            ? { ...payload.painScores }
            : state.painScores,
          dayCompletedAt: payload.dayCompletedAt
            ? { ...payload.dayCompletedAt }
            : state.dayCompletedAt,
        })),
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
          levelsCompleted: 0,
          dayCompletedAt: {},
          activeAuthUserId: null,
          coachTourSeen: false,
          coachTourStep: null,
          devUnlockOverride: false,
          pendingBadgeCelebrations: [],
        }),
    }),
    {
      // Bumped so older APK local profiles (saved name/progress) are not reused.
      name: 'oncofitness-app-v8',
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
        levelsCompleted: state.levelsCompleted,
        dayCompletedAt: state.dayCompletedAt,
        activeAuthUserId: state.activeAuthUserId,
        coachTourSeen: state.coachTourSeen,
        devUnlockOverride: state.devUnlockOverride,
      }),
    },
  ),
);
