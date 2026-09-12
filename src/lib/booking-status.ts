// Shared between the server action (validates transitions) and the client
// dropdown (only offers valid next statuses) — kept in a plain module so
// neither the "use server" file nor the client component runs into the
// non-function-export-from-"use server" problem documented elsewhere in
// this codebase (src/lib/settings-tabs.ts has the full explanation).
export const BOOKING_STATUSES = [
  "invited",
  "draft",
  "scheduled",
  "live",
  "completed",
  "declined",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// `invited` and `declined` are reached only through the creator's own
// respond_to_booking_invite RPC (accept/decline) — not from this brand-
// facing manual status control, which previously allowed jumping straight
// from `invited` to e.g. `live`, skipping the creator's acceptance
// entirely. `completed` and `declined` are terminal.
export const ALLOWED_BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  invited: [],
  draft: ["scheduled", "live", "completed"],
  scheduled: ["draft", "live", "completed"],
  live: ["completed"],
  completed: [],
  declined: [],
};
