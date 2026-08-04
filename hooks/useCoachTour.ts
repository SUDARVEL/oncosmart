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

function isValidRect(x: number, y: number, width: number, height: number): boolean {
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width >= 1 &&
    height >= 1
  );
}

/**
 * Crash-safe coach tour driver.
 *
 * Alignment rule (all devices): measure target + host in window space, then
 * convert to HOST-relative coords for the in-tree absolute overlay. This cancels
 * status-bar / native-stack offsets that break raw measureInWindow placement.
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
    // Ref-only — never setState here (inline refs re-fire every render).
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
    const timers: ReturnType<typeof setTimeout>[] = [];

    const applyRect = (x: number, y: number, width: number, height: number) => {
      if (cancelled || !isValidRect(x, y, width, height)) return;
      setRect((prev) => {
        if (
          prev &&
          Math.abs(prev.x - x) < 0.5 &&
          Math.abs(prev.y - y) < 0.5 &&
          Math.abs(prev.width - width) < 0.5 &&
          Math.abs(prev.height - height) < 0.5
        ) {
          return prev;
        }
        return { x, y, width, height };
      });
    };

    const measure = () => {
      try {
        const node = targetsRef.current[step.id];
        const host = hostRef.current;
        if (!node || typeof node.measureInWindow !== 'function') return;

        // Hard rule: host-relative = targetWindow - hostWindow.
        // Works on every Android/iOS inset / native-stack offset.
        if (host && typeof host.measureInWindow === 'function') {
          host.measureInWindow((hostX, hostY) => {
            if (cancelled) return;
            node.measureInWindow((x, y, width, height) => {
              if (cancelled) return;
              if (!isValidRect(x, y, width, height)) return;
              if (!Number.isFinite(hostX) || !Number.isFinite(hostY)) {
                applyRect(x, y, width, height);
                return;
              }
              applyRect(x - hostX, y - hostY, width, height);
            });
          });
          return;
        }

        node.measureInWindow((x, y, width, height) => {
          applyRect(x, y, width, height);
        });
      } catch {
        // ignore
      }
    };

    const delays = [80, 160, 280, 450, 700, 1000, 1500, 2200];
    const tick = () => {
      if (cancelled) return;
      measure();
      if (attempts < delays.length) {
        const wait = delays[attempts];
        attempts += 1;
        timers.push(setTimeout(tick, wait));
      }
    };

    timers.push(
      setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          tick();
        });
      }, 40),
    );

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
