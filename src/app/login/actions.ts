"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Route by role — /creator then gates on onboarding progress and forwards
  // an unfinished creator to the step they left off at.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    console.error("[login] profile fetch failed:", profileError.message);
  }

  // requireBrand/requireCreator enforce the real gate either way (and now
  // fail closed on a fetch error) — this just lands on the right page on
  // the first try instead of a bounce.
  const role = profile?.role === "creator" ? "creator" : "brand";
  const fallback = role === "creator" ? "/creator" : "/brand";

  // Only honor `next` if it's a same-origin path under the right portal —
  // anything else (an external URL, or the other role's portal) falls back
  // to the plain role root instead of trusting an unvalidated redirect
  // target.
  const safeNext = next.startsWith(`/${role}`) ? next : fallback;
  redirect(safeNext);
}
