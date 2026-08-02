import { useEffect, useRef } from 'react';

import { getCurrentSession, onAuthStateChange } from '../lib/auth';
import { isAdminSession } from '../lib/isAdmin';
import { syncNextExerciseNotification } from '../lib/nextExerciseNotification';
import {
  loadCloudProfileIntoStore,
  saveCloudProfileFromStore,
  upsertSessionCompletion,
} from '../lib/userCloudSync';
import { useAppStore } from '../store/useAppStore';

const SAVE_DEBOUNCE_MS = 900;

/**
 * Keeps the signed-in user's local store and Supabase patient row in sync.
 * Mount once near the app root.
 */
export function CloudSyncBridge() {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCompletionJson = useRef<string>('');

  const activeAuthUserId = useAppStore((s) => s.activeAuthUserId);
  const language = useAppStore((s) => s.language);
  const username = useAppStore((s) => s.username);
  const age = useAppStore((s) => s.age);
  const ageRange = useAppStore((s) => s.ageRange);
  const gender = useAppStore((s) => s.gender);
  const cancerType = useAppStore((s) => s.cancerType);
  const treatmentUndergoing = useAppStore((s) => s.treatmentUndergoing);
  const underwentSurgery = useAppStore((s) => s.underwentSurgery);
  const avatar = useAppStore((s) => s.avatar);
  const parqAnswers = useAppStore((s) => s.parqAnswers);
  const parqCleared = useAppStore((s) => s.parqCleared);
  const progressPaused = useAppStore((s) => s.progressPaused);
  const painScores = useAppStore((s) => s.painScores);
  const dayCompletedAt = useAppStore((s) => s.dayCompletedAt);
  const levelsCompleted = useAppStore((s) => s.levelsCompleted);

  // Load cloud profile whenever auth session is present / changes.
  useEffect(() => {
    let cancelled = false;

    const hydrate = async (userId: string) => {
      const ok = await loadCloudProfileIntoStore(userId);
      if (cancelled || !ok) return;
      const completions = useAppStore.getState().dayCompletedAt;
      void syncNextExerciseNotification(completions);
    };

    void getCurrentSession().then((session) => {
      if (cancelled || !session?.user?.id || isAdminSession(session)) return;
      void hydrate(session.user.id);
    });

    const unsubscribe = onAuthStateChange((session) => {
      if (!session?.user?.id || isAdminSession(session)) return;
      void hydrate(session.user.id);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Debounced save of profile + progress JSON.
  useEffect(() => {
    if (!activeAuthUserId) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveCloudProfileFromStore(activeAuthUserId);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    activeAuthUserId,
    language,
    username,
    age,
    ageRange,
    gender,
    cancerType,
    treatmentUndergoing,
    underwentSurgery,
    avatar,
    parqAnswers,
    parqCleared,
    progressPaused,
    painScores,
    dayCompletedAt,
    levelsCompleted,
  ]);

  // Mirror new session completions into exercise_completions rows.
  useEffect(() => {
    if (!activeAuthUserId) return;
    const json = JSON.stringify(dayCompletedAt);
    if (json === lastCompletionJson.current) return;
    const previous = lastCompletionJson.current
      ? (JSON.parse(lastCompletionJson.current) as Record<string, number>)
      : {};
    lastCompletionJson.current = json;

    for (const [key, at] of Object.entries(dayCompletedAt)) {
      if (previous[key]) continue;
      const match = /^L(\d+)D(\d+)$/.exec(key);
      if (!match) continue;
      const level = Number(match[1]);
      const dayInLevel = Number(match[2]);
      const painScore = painScores[`${level}:${dayInLevel}`];
      void upsertSessionCompletion({
        userId: activeAuthUserId,
        level,
        dayInLevel,
        completedAt: at,
        painScore,
      });
    }
  }, [activeAuthUserId, dayCompletedAt, painScores]);

  return null;
}
