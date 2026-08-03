/**
 * Mon–Sun streak + pain helpers using the device's local calendar/timezone.
 */

import { parseSessionKey } from './programProgress';

export type WeekdayStreak = {
  /** Local short labels for Mon–Sun (device locale). */
  labels: string[];
  /** True when any session was completed on that weekday in the current local week. */
  completed: boolean[];
};

function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Monday 00:00 local for the week containing `now`. */
export function getLocalWeekMonday(now: number = Date.now()): Date {
  const d = startOfLocalDay(new Date(now));
  const day = d.getDay(); // 0 Sun … 6 Sat
  const daysSinceMonday = (day + 6) % 7;
  d.setDate(d.getDate() - daysSinceMonday);
  return d;
}

/** Short Mon–Sun labels from the phone locale (e.g. MON / திங்கள்). */
export function getWeekdayLabels(locale: string = 'en'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 2024-01-01 is a Monday.
  const monday = new Date(2024, 0, 1, 12, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const label = formatter.format(day).replace(/\./g, '').trim();
    return label.toLocaleUpperCase(locale);
  });
}

/** Map JS getDay() (0=Sun) to Mon-first index (0=Mon … 6=Sun). */
export function jsDayToMondayIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function weekBounds(now: number): { weekStart: number; weekEnd: number } {
  const monday = getLocalWeekMonday(now);
  const weekStart = monday.getTime();
  const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
  return { weekStart, weekEnd };
}

/**
 * Marks Mon–Sun circles from completion timestamps in the current local week.
 * Completing a session on Saturday fills Saturday only.
 */
export function getCurrentWeekdayStreak(
  completions: Record<string, number>,
  options?: { now?: number; locale?: string },
): WeekdayStreak {
  const now = options?.now ?? Date.now();
  const locale = options?.locale ?? 'en';
  const labels = getWeekdayLabels(locale);
  const completed = [false, false, false, false, false, false, false];
  const { weekStart, weekEnd } = weekBounds(now);

  for (const value of Object.values(completions)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    if (value < weekStart || value >= weekEnd) continue;
    completed[jsDayToMondayIndex(new Date(value).getDay())] = true;
  }

  return { labels, completed };
}

/**
 * Pain scores for Mon–Sun of the current local week.
 *
 * Placement rules (in order):
 * 1. Session completed this week + matching pain key `${level}:${day}` → that weekday
 * 2. Else pain key exists and its session completed this week (same as 1, defensive)
 * 3. Else if we still have no bars but have any pain score + a completion this week,
 *    put the latest pain on the latest completion weekday this week
 * 4. Else if we have pain but no completion this week, put the latest pain on today's bar
 *    so the graph never shows a score in the header with an empty chart
 */
export function getCurrentWeekPainScores(
  completions: Record<string, number>,
  painScores: Record<string, number>,
  options?: { now?: number },
): Array<number | null> {
  const now = options?.now ?? Date.now();
  const scores: Array<number | null> = [null, null, null, null, null, null, null];
  const { weekStart, weekEnd } = weekBounds(now);
  const latestAt = [-1, -1, -1, -1, -1, -1, -1];

  let latestWeekCompletionAt = -1;
  let latestWeekCompletionIdx = -1;

  for (const [key, completedAt] of Object.entries(completions)) {
    if (typeof completedAt !== 'number' || !Number.isFinite(completedAt)) continue;
    if (completedAt < weekStart || completedAt >= weekEnd) continue;

    const idx = jsDayToMondayIndex(new Date(completedAt).getDay());
    if (completedAt >= latestWeekCompletionAt) {
      latestWeekCompletionAt = completedAt;
      latestWeekCompletionIdx = idx;
    }

    const parsed = parseSessionKey(key);
    if (!parsed) continue;

    const painKey = `${parsed.level}:${parsed.dayInLevel}`;
    const score = painScores[painKey];
    if (typeof score !== 'number' || !Number.isFinite(score)) continue;

    if (completedAt >= latestAt[idx]) {
      latestAt[idx] = completedAt;
      scores[idx] = score;
    }
  }

  const hasAnyBar = scores.some((v) => typeof v === 'number');
  if (hasAnyBar) return scores;

  // Fallback: pick the most recently written pain score.
  let latestPain: number | null = null;
  for (const value of Object.values(painScores)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    latestPain = value;
  }
  if (latestPain == null) return scores;

  if (latestWeekCompletionIdx >= 0) {
    scores[latestWeekCompletionIdx] = latestPain;
    return scores;
  }

  // No completion this week — still show today's bar so header score isn't orphaned.
  scores[jsDayToMondayIndex(new Date(now).getDay())] = latestPain;
  return scores;
}
