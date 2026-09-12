// Plain module (not exported from a "use client" or "use server" file) so
// both the Server Component page (validating ?tab=) and the Client
// Component nav can import the same source of truth — see
// src/lib/settings-tabs.ts for why this can't live in either of those.
export const CREATOR_SETTINGS_TABS = ["Profile", "Payments", "Account"] as const;
export type CreatorSettingsTab = (typeof CREATOR_SETTINGS_TABS)[number];
