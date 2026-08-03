import { useCallback, useState } from 'react';

import { useAppStore } from '../store/useAppStore';

/**
 * Global pause gate for exercise entry points (home, workouts, session screens).
 * When progress is paused, callers show the resume popup instead of navigating.
 */
export function useExercisePauseGuard() {
  const progressPaused = useAppStore((state) => state.progressPaused);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const dismissResumeModal = useCallback(() => {
    setShowResumeModal(false);
  }, []);

  const runIfProgressActive = useCallback(
    (action: () => void): boolean => {
      if (progressPaused) {
        setShowResumeModal(true);
        return false;
      }
      action();
      return true;
    },
    [progressPaused],
  );

  return {
    progressPaused,
    showResumeModal,
    dismissResumeModal,
    runIfProgressActive,
  };
}
