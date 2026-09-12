export function defaultPostByDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export function daysFromNow(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const days = Math.round((target - Date.now()) / 86_400_000);
  return Math.max(days, 0);
}

export type WorkMode = "specific_brief" | "creative_freedom";
export type ContentApproval = "auto" | "manual";

export type CampaignOption = { id: string; name: string };
