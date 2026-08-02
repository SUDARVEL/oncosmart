import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager, type View } from 'react-native';

import type { CoachTargetRect } from '../components/coach/CoachMarkOverlay';
import {
  COACH_TOUR_STEPS,
  type CoachTourScreen,
  type CoachTourStepId,
} from '../lib/coachTour';
import { useAppStore } from '../store/useAppStore';

type TargetMap = Partial<Record<CoachTourStepId, View | null>>;

function waitForHydration(): Promise<void> {
  const persistApi = useAppStore.persist;
  if (persistApi.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = persistApi.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

/**
 * Crash-safe coach tour driver.
 * Targets live in a ref (never setState from ref callbacks).
 * Overlay is in-screen (not Modal) so measureInWindow aligns.
 */
export function useCoachTour(screen: CoachTourScreen) {
  const coachTourSeen = useAppStore((s) => s.coachTourSeen === true);
  const coachTourStep = useAppStore((s) => s.coachTourStep);
  const setCoachTourStep = useAppStore((s) => s.setCoachTourStep);
  const setCoachTourSeen = useAppStore((s) => s.setCoachTourSeen);

  const [hydrated, setHydrated] = useState(false);
  const [rect, setRect] = useState<CoachTargetRect | null>(null);
  const [measureTick, setMeasureTick] = useState(0);
  const targetsRef = useRef<TargetMap>({});

  useEffect(() => {
    let alive = true;
    void waitForHydration().then(() => {
      if (alive) setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const registerTarget = useCallback((id: CoachTourStepId, node: View | null) => {
    targetsRef.current[id] = node;
  }, []);

  const step =
    coachTourStep != null &&
    Number.isFinite(coachTourStep) &&
    coachTourStep >= 0 &&
    coachTourStep < COACH_TOUR_STEPS.length
      ? COACH_TOUR_STEPS[coachTourStep]
      : null;

  const active = Boolean(step && step.screen === screen);

  useEffect(() => {
    if (!hydrated || coachTourSeen || coachTourStep != null) return;
    if (screen !== 'home') return;
    const state = useAppStore.getState();
    if (!state.avatar || state.parqCleared == null) return;
    const timer = setTimeout(() => {
      try {
        setCoachTourStep(0);
      } catch {
        // ignore
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [hydrated, coachTourSeen, coachTourStep, screen, setCoachTourStep]);

  useEffect(() => {
    if (!active || !step) {
      setRect(null);
      return;
    }
    // Delay a tick so Growth tab switches / navigation can finish layout.
    const handle = InteractionManager.runAfterInteractions(() => {
      setMeasureTick((n) => n + 1);
    });
    return () => handle.cancel();
  }, [active, step?.id]);

  useEffect(() => {
    if (!active || !step) return;
    let cancelled = false;

    const measure = () => {
      try {
        const node = targetsRef.current[step.id];
        if (!node || typeof node.measureInWindow !== 'function') {
          if (!cancelled) setRect(null);
          return;
        }
        node.measureInWindow((x, y, width, height) => {
          if (cancelled) return;
          if (
            !Number.isFinite(x) ||
            !Number.isFinite(y) ||
            !Number.isFinite(width) ||
            !Number.isFinite(height) ||
            width < 1 ||
            height < 1
          ) {
            setRect(null);
            return;
          }
          setRect({ x, y, width, height });
        });
      } catch {
        if (!cancelled) setRect(null);
      }
    };

    // Multiple passes — pills/tabs often settle after the first paint.
    const t1 = setTimeout(measure, 60);
    const t2 = setTimeout(measure, 220);
    const t3 = setTimeout(measure, 480);
    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active, step, measureTick]);

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
