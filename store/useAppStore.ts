import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppLanguage = 'en' | 'ta';
export type AppGender = 'male' | 'female' | 'prefer_not_to_say';
export type AppAvatar = 'male' | 'female';
export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55-64';

type AppState = {
  language: AppLanguage | null;
  username: string;
  ageRange: AgeRange | null;
  gender: AppGender | null;
  avatar: AppAvatar | null;
  parqAnswers: (boolean | null)[];
  parqCleared: boolean | null;
  painScores: Record<string, number>;
  progressPaused: boolean;
  levelsCompleted: number;
  /** Epoch ms when each day's guided session was completed, keyed by day number. */
  dayCompletedAt: Record<string, number>;
  /** Dev-only flag that bypasses the 24h unlock delay between days. */
  devUnlockOverride: boolean;
  setLanguage: (language: AppLanguage) => void;
  setUsername: (username: string) => void;
  setAgeRange: (ageRange: AgeRange) => void;
  setGender: (gender: AppGender) => void;
  setAvatar: (avatar: AppAvatar) => void;
  setParqAnswer: (index: number, value: boolean) => void;
  setParqCleared: (cleared: boolean) => void;
  setPainScore: (day: number, score: number) => void;
  setProgressPaused: (paused: boolean) => void;
  setLevelsCompleted: (count: number) => void;
  /** Record a day's completion (timestamp) and keep levelsCompleted in sync. */
  markDayCompleted: (day: number, when?: number) => void;
  setDevUnlockOverride: (value: boolean) => void;
  /** Dev-only: wipe day progress without touching onboarding profile. */
  devResetProgress: () => void;
  resetApp: () => void;
};

const INITIAL_PARQ_ANSWERS: (boolean | null)[] = Array(7).fill(null);

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: null,
      username: '',
      ageRange: null,
      gender: null,
      avatar: null,
      parqAnswers: [...INITIAL_PARQ_ANSWERS],
      parqCleared: null,
      painScores: {},
      progressPaused: false,
      levelsCompleted: 0,
      dayCompletedAt: {},
      devUnlockOverride: false,
      setLanguage: (language) => set({ language }),
      setUsername: (username) => set({ username }),
      setAgeRange: (ageRange) => set({ ageRange }),
      setGender: (gender) => set({ gender }),
      setAvatar: (avatar) => set({ avatar }),
      setParqAnswer: (index, value) =>
        set((state) => {
          const next = [...state.parqAnswers];
          next[index] = value;
          return { parqAnswers: next };
        }),
      setParqCleared: (cleared) => set({ parqCleared: cleared }),
      setPainScore: (day, score) =>
        set((state) => ({
          painScores: { ...state.painScores, [String(day)]: score },
        })),
      setProgressPaused: (paused) => set({ progressPaused: paused }),
      setLevelsCompleted: (count) => set({ levelsCompleted: count }),
      markDayCompleted: (day, when) =>
        set((state) => {
          const key = String(day);
          if (state.dayCompletedAt[key]) {
            return state;
          }
          const dayCompletedAt = { ...state.dayCompletedAt, [key]: when ?? Date.now() };
          return {
            dayCompletedAt,
            levelsCompleted: Math.max(state.levelsCompleted, Object.keys(dayCompletedAt).length),
          };
        }),
      setDevUnlockOverride: (value) => set({ devUnlockOverride: value }),
      devResetProgress: () =>
        set({
          dayCompletedAt: {},
          levelsCompleted: 0,
          devUnlockOverride: false,
          painScores: {},
        }),
      resetApp: () =>
        set({
          language: null,
          username: '',
          ageRange: null,
          gender: null,
          avatar: null,
          parqAnswers: [...INITIAL_PARQ_ANSWERS],
          parqCleared: null,
          painScores: {},
          progressPaused: false,
          levelsCompleted: 0,
          dayCompletedAt: {},
          devUnlockOverride: false,
        }),
    }),
    {
      name: 'oncofitness-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        username: state.username,
        ageRange: state.ageRange,
        gender: state.gender,
        avatar: state.avatar,
        parqAnswers: state.parqAnswers,
        parqCleared: state.parqCleared,
        painScores: state.painScores,
        progressPaused: state.progressPaused,
        levelsCompleted: state.levelsCompleted,
        dayCompletedAt: state.dayCompletedAt,
        devUnlockOverride: state.devUnlockOverride,
      }),
    },
  ),
);
