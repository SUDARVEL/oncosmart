import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager, type View } from 'react-native';

import type { CoachTargetRect } from '../components/coach/CoachMarkOverlay';
import {
  COACH_TOUR_STEPS,
  type CoachTourScreen,
  type CoachTourStepId,
} from '../lib/coachTour';
import { getCompletedSessionCount } from '../lib/programProgress';
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
 * Measures targets in window coordinates (overlay uses a fullscreen Modal).
 *
 * Auto-starts ONLY for first-time onboarded users who have never finished the
 * tour and have not completed any exercise day. Returning users / day-1+
 * completers skip it; Settings → Replay tips can still restart it.
 */
export function useCoachTour(screen: CoachTourScreen) {
  const coachTourSeen = useAppStore((s) => s.coachTourSeen === true);
  const coachTourStep = useAppStore((s) => s.coachTourStep);
  const cloudProfileReady = useAppStore((s) => s.cloudProfileReady === true);
  const dayCompletedAt = useAppStore((s) => s.dayCompletedAt);
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

  // Host registration kept for call-site compatibility (measurement is window-based).
  const registerHost = useCallback((_node: View | null) => {}, []);

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
  const completedCount = getCompletedSessionCount(dayCompletedAt);

  useEffect(() => {
    // Wait for local persist + cloud profile so returning users never flash the tour.
    if (!hydrated || !cloudProfileReady) return;
    if (coachTourSeen || coachTourStep != null) return;
    if (screen !== 'home') return;

    const state = useAppStore.getState();
    // Must be fully onboarded (answered questions + avatar).
    if (!state.avatar || state.parqCleared == null) return;
    // Anyone who already completed a day has used the app — no auto tips.
    if (getCompletedSessionCount(state.dayCompletedAt) > 0) {
      setCoachTourSeen(true);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const latest = useAppStore.getState();
        if (latest.coachTourSeen) return;
        if (latest.coachTourStep != null) return;
        if (getCompletedSessionCount(latest.dayCompletedAt) > 0) {
          setCoachTourSeen(true);
          return;
        }
        setCoachTourStep(0);
      } catch {
        // ignore
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [
    hydrated,
    cloudProfileReady,
    coachTourSeen,
    coachTourStep,
    screen,
    completedCount,
    setCoachTourStep,
    setCoachTourSeen,
  ]);

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

    const t1 = setTimeout(measure, 40);
    const t2 = setTimeout(measure, 180);
    const t3 = setTimeout(measure, 420);
    const t4 = setTimeout(measure, 800);
    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
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
