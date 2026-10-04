import { useEffect } from 'react';

import { COACH_TOUR_FINALE_MS, COACH_TOUR_STEPS } from '../../lib/coachTour';
import { useAppStore } from '../../store/useAppStore';

/**
 * Plays the first-run tour on a clock. Screens only draw the current beat.
 * One director, so Home and Growth cannot advance the tour twice.
 */
export function CoachTourDirector() {
  const coachTourSeen = useAppStore((state) => state.coachTourSeen === true);
  const coachTourStep = useAppStore((state) => state.coachTourStep);
  const setCoachTourStep = useAppStore((state) => state.setCoachTourStep);
  const setCoachTourSeen = useAppStore((state) => state.setCoachTourSeen);

  useEffect(() => {
    if (coachTourSeen || coachTourStep == null) return;
    const ms =
      coachTourStep >= COACH_TOUR_STEPS.length
        ? COACH_TOUR_FINALE_MS
        : COACH_TOUR_STEPS[coachTourStep]?.durationMs ?? COACH_TOUR_FINALE_MS;
    const timer = setTimeout(() => {
      const latest = useAppStore.getState();
      if (latest.coachTourSeen || latest.coachTourStep !== coachTourStep) return;
      if (coachTourStep >= COACH_TOUR_STEPS.length) {
        setCoachTourSeen(true);
        setCoachTourStep(null);
        return;
      }
      setCoachTourStep(coachTourStep + 1);
    }, ms);
    return () => clearTimeout(timer);
  }, [coachTourSeen, coachTourStep, setCoachTourSeen, setCoachTourStep]);

  return null;
}
