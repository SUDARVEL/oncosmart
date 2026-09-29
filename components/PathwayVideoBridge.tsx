import { useEffect, useRef } from 'react';

import { normalizeCancerTypeSlug } from '../lib/cancerPathway';
import { clearLevelExercisesCache } from '../lib/getDayExercises';
import { warmPathwaySessionsFromStore } from '../lib/getDay1Session';
import { clearPathwayVideoCache } from '../lib/pathwayVideoIndex';
import { useAppStore } from '../store/useAppStore';

/**
 * Loads Supabase pathway video index and builds per-level session caches
 * when the user's gender, language, avatar, or cancer type changes.
 */
export function PathwayVideoBridge() {
  const gender = useAppStore((s) => s.gender);
  const avatar = useAppStore((s) => s.avatar);
  const language = useAppStore((s) => s.language);
  const cancerType = useAppStore((s) => s.cancerType);
  const warmGeneration = useRef(0);

  useEffect(() => {
    const slug = normalizeCancerTypeSlug(cancerType);
    if (!slug) return;

    const generation = warmGeneration.current + 1;
    warmGeneration.current = generation;

    clearLevelExercisesCache();
    void warmPathwaySessionsFromStore().then((ok) => {
      if (generation !== warmGeneration.current) return;
      if (!ok) {
        clearPathwayVideoCache();
      }
    });

    return () => {
      warmGeneration.current += 1;
    };
  }, [gender, avatar, language, cancerType]);

  return null;
}
