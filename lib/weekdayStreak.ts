/**
 * Mon–Fri streak helpers using the device's local calendar/timezone.
 */

export type WeekdayStreak = {
  /** Local short labels for Mon–Fri (device locale). */
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

/** Short Mon–Fri labels from the phone locale (e.g. MON / திங்கள்). */
export function getWeekdayLabels(locale: string = 'en'): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // 2024-01-01 is a Monday in local interpretation via noon UTC→safe local Mon–Fri.
  const monday = new Date(2024, 0, 1, 12, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const label = formatter.format(day).replace(/\./g, '').trim();
    return label.toLocaleUpperCase(locale);
  });
}

/**
 * Marks Mon–Fri circles from completion timestamps in the current local week.
 * Completing a session on Monday fills Monday only — not “first N days of the level”.
 */
export function getCurrentWeekdayStreak(
  completions: Record<string, number>,
  options?: { now?: number; locale?: string },
): WeekdayStreak {
  const now = options?.now ?? Date.now();
  const locale = options?.locale ?? 'en';
  const labels = getWeekdayLabels(locale);
  const completed = [false, false, false, false, false];

  const monday = getLocalWeekMonday(now);
  const weekStart = monday.getTime();
  // Exclusive end: Saturday 00:00 local (covers Mon–Fri only).
  const weekEnd = weekStart + 5 * 24 * 60 * 60 * 1000;

  for (const value of Object.values(completions)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) continue;
    if (value < weekStart || value >= weekEnd) continue;

    const weekday = new Date(value).getDay(); // 0 Sun … 6 Sat
    if (weekday >= 1 && weekday <= 5) {
      completed[weekday - 1] = true;
    }
  }

  return { labels, completed };
}
