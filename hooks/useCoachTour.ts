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
 * Measures targets in window coordinates (overlay is an in-tree absolute layer).
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

  // Kept for call-site compatibility (overlay uses the same host tree).
  const registerHost = useCallback((_node: View | null) => {}, []);

  const registerTarget = useCallback((id: CoachTourStepId, node: View | null) => {
    // Ref-only — never setState here. Inline ref callbacks re-fire every render;
    // setState would infinite-loop and crash the screen on open.
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
    if (!hydrated || !cloudProfileReady) return;
    if (coachTourSeen || coachTourStep != null) return;
    if (screen !== 'home') return;

    const state = useAppStore.getState();
    if (!state.avatar || state.parqCleared == null) return;
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
    }, 700);
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
    let attempts = 0;

    const applyRect = (x: number, y: number, width: number, height: number) => {
      if (cancelled) return;
      if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width < 1 ||
        height < 1
      ) {
        return;
      }
      setRect({ x, y, width, height });
    };

    const measure = () => {
      try {
        const node = targetsRef.current[step.id];
        if (!node || typeof node.measureInWindow !== 'function') {
          return;
        }

        // Overlay is in-tree under the same host — window coords match absoluteFill.
        node.measureInWindow((x, y, width, height) => applyRect(x, y, width, height));
      } catch {
        // ignore
      }
    };

    const tick = () => {
      if (cancelled) return;
      attempts += 1;
      measure();
      if (attempts < 8) {
        timers.push(setTimeout(tick, attempts < 3 ? 80 : 220));
      }
    };

    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(tick, 16));
    return () => {
      cancelled = true;
      for (const t of timers) clearTimeout(t);
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
