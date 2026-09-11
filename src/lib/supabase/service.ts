import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client. Bypasses RLS entirely.
// Server-only: never import this into a Client Component, and only use it
// where the request itself has no user session to check against — e.g. the
// public /r/[slug] click-tracking redirect, which anonymous LinkedIn
// visitors hit directly.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
