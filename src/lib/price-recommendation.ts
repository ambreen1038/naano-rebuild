// Same heuristic used at onboarding (src/app/creator/onboarding/price/page.tsx)
// — kept in one place so the Edit Price & Bundle modal's "indicative
// estimate" and onboarding's "recommended price" can't quietly drift into
// two different formulas. Openly a formula-based heuristic, never
// presented as real market/analytics data we don't have.
export function recommendPrice(followers: number | null): number {
  if (!followers) return 20;
  return Math.max(20, Math.round(followers * 0.085));
}

export function estimatedRange(followers: number | null): { low: number; high: number } {
  const mid = recommendPrice(followers);
  return {
    low: Math.max(20, Math.round(mid * 0.7)),
    high: Math.round(mid * 1.4),
  };
}
