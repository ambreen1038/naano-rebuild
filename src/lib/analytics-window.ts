const DAY_MS = 86_400_000;

export type DayBucket = { date: string; count: number };

/**
 * Time-window helpers for the Results analytics. These live outside the page
 * module on purpose: reading the clock is impure, and calling it inline in a
 * Server Component body trips the React Compiler's purity rule.
 */
export function analyticsWindow(days = 30) {
  const now = Date.now();
  const since = now - days * DAY_MS;

  const buckets: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    buckets[new Date(now - i * DAY_MS).toISOString().slice(0, 10)] = 0;
  }

  return { since, buckets };
}

export function bucketClicksByDay(
  clicks: { clicked_at: string }[],
  buckets: Record<string, number>
): DayBucket[] {
  const filled = { ...buckets };
  for (const c of clicks) {
    const day = c.clicked_at.slice(0, 10);
    if (day in filled) filled[day] += 1;
  }
  return Object.entries(filled).map(([date, count]) => ({ date, count }));
}

export function daysSince(iso: string, now: number) {
  return (now - new Date(iso).getTime()) / DAY_MS;
}
