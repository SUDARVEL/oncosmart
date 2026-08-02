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
 * Measures targets relative to a host view so the highlight lines up.
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
  const hostRef = useRef<View | null>(null);

  useEffect(() => {
    let alive = true;
    void waitForHydration().then(() => {
      if (alive) setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const registerHost = useCallback((node: View | null) => {
    hostRef.current = node;
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
        const host = hostRef.current;
        if (!node || typeof node.measureInWindow !== 'function') {
          if (!cancelled) setRect(null);
          return;
        }

        const apply = (x: number, y: number, width: number, height: number) => {
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
        };

        // Convert window coords → host-local coords so the highlight aligns.
        if (host && typeof host.measureInWindow === 'function') {
          host.measureInWindow((hx, hy) => {
            node.measureInWindow((x, y, width, height) => {
              apply(x - hx, y - hy, width, height);
            });
          });
          return;
        }

        node.measureInWindow(apply);
      } catch {
        if (!cancelled) setRect(null);
      }
    };

    const t1 = setTimeout(measure, 80);
    const t2 = setTimeout(measure, 260);
    const t3 = setTimeout(measure, 520);
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
    registerHost,
    registerTarget,
    next,
    skip: finish,
    coachTourStep,
  };
}
