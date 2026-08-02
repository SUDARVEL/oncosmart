import { useCallback, useEffect, useState } from 'react';
import { type View } from 'react-native';

import {
  COACH_TOUR_STEPS,
  type CoachTourScreen,
  type CoachTourStepId,
} from '../lib/coachTour';
import { useAppStore } from '../store/useAppStore';
import type { CoachTargetRect } from '../components/coach/CoachMarkOverlay';

type TargetMap = Partial<Record<CoachTourStepId, View | null>>;

/**
 * Measures registered target views and drives coach-tour step visibility
 * for a given screen (home or growth).
 */
export function useCoachTour(screen: CoachTourScreen) {
  const coachTourSeen = useAppStore((s) => s.coachTourSeen);
  const coachTourStep = useAppStore((s) => s.coachTourStep);
  const setCoachTourStep = useAppStore((s) => s.setCoachTourStep);
  const setCoachTourSeen = useAppStore((s) => s.setCoachTourSeen);
  const [hydrated, setHydrated] = useState(
    () => useAppStore.persist.hasHydrated(),
  );
  const [targets, setTargets] = useState<TargetMap>({});
  const [rect, setRect] = useState<CoachTargetRect | null>(null);

  useEffect(() => {
    if (hydrated) return;
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  const registerTarget = useCallback((id: CoachTourStepId, node: View | null) => {
    setTargets((prev) => {
      if (prev[id] === node) return prev;
      return { ...prev, [id]: node };
    });
  }, []);

  const step =
    coachTourStep != null && coachTourStep >= 0 && coachTourStep < COACH_TOUR_STEPS.length
      ? COACH_TOUR_STEPS[coachTourStep]
      : null;

  const active = Boolean(step && step.screen === screen);

  // Auto-start once after first successful onboarding (local avatar + PAR-Q).
  useEffect(() => {
    if (!hydrated || coachTourSeen || coachTourStep != null) return;
    if (screen !== 'home') return;
    const state = useAppStore.getState();
    if (!state.avatar || state.parqCleared == null) return;
    const timer = setTimeout(() => setCoachTourStep(0), 600);
    return () => clearTimeout(timer);
  }, [hydrated, coachTourSeen, coachTourStep, screen, setCoachTourStep]);

  // Measure active target whenever step or layout may change.
  useEffect(() => {
    if (!active || !step) {
      setRect(null);
      return;
    }
    let cancelled = false;
    const measure = () => {
      const node = targets[step.id];
      if (!node || typeof node.measureInWindow !== 'function') {
        setRect(null);
        return;
      }
      node.measureInWindow((x, y, width, height) => {
        if (cancelled) return;
        if (width < 1 || height < 1) {
          setRect(null);
          return;
        }
        setRect({ x, y, width, height });
      });
    };
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 250);
    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, step, targets]);

  const finish = useCallback(() => {
    setCoachTourSeen(true);
    setCoachTourStep(null);
  }, [setCoachTourSeen, setCoachTourStep]);

  const next = useCallback(() => {
    if (coachTourStep == null) return;
    if (coachTourStep >= COACH_TOUR_STEPS.length - 1) {
      finish();
      return;
    }
    setCoachTourStep(coachTourStep + 1);
  }, [coachTourStep, finish, setCoachTourStep]);

  return {
    hydrated,
    active,
    step,
    stepIndex: coachTourStep ?? 0,
    stepCount: COACH_TOUR_STEPS.length,
    rect,
    registerTarget,
    next,
    skip: finish,
    coachTourStep,
  };
}
