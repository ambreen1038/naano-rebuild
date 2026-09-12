// Plain module — client-side upload validation constants used by
// ChangePhotoModal. Kept out of the "use server" actions file: a
// non-function export from a "use server" module breaks when a client
// component imports it directly (see src/lib/settings-tabs.ts's comment
// for the full explanation of why).
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
