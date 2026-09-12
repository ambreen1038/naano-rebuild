// Shared between the Server Component (brand/settings/page.tsx, which
// validates the ?tab= search param) and the Client Component
// (SettingsClient.tsx, which renders the tab links) — kept in a plain
// module rather than exported from SettingsClient itself, because
// Next.js replaces every export of a "use client" file with an opaque
// client reference when imported from server code, so a Server Component
// importing a plain array from a "use client" file doesn't get a real
// array at runtime (this is what caused `SETTINGS_TABS.includes is not a
// function`).
export const SETTINGS_TABS = ["Profile", "Audience", "Team & access", "Integrations"] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];
