import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreatorOnboarding = {
  user_id: string;
  step: number;
  linkedin_url: string | null;
  linkedin_name: string | null;
  linkedin_headline: string | null;
  linkedin_avatar_url: string | null;
  linkedin_follower_count: number | null;
  linkedin_imported_at: string | null;
  country: string | null;
  industry_tags: string[];
  price_per_post: number | null;
  completed_at: string | null;
};

const STEP_ROUTES: Record<number, string> = {
  2: "/creator/onboarding/linkedin",
  3: "/creator/onboarding/profile",
  4: "/creator/onboarding/price",
};

/** Server-side gate for brand-only routes. Resolves the active brand/space. */
export async function requireBrand() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name, active_brand_id")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[requireBrand] profile fetch failed:", error.message);
  }

  // Fail closed: if we can't determine the role, do NOT default to brand
  // access. (This was a real bug — the old check only redirected when role
  // was confirmed 'creator', so a failed fetch silently rendered the brand
  // dashboard for anyone, regardless of their real role.)
  if (!profile) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Couldn't load your account. Please sign in again."
      )}`
    );
  }

  if (profile.role === "creator") redirect("/creator");

  let activeBrandId = profile.active_brand_id;

  // Self-heal: no active space recorded (or it's stale) — fall back to
  // whichever space this user belongs to first, and persist that choice.
  if (!activeBrandId) {
    const { data: membership } = await supabase
      .from("brand_members")
      .select("brand_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    activeBrandId = membership?.brand_id ?? null;
    if (activeBrandId) {
      await supabase
        .from("profiles")
        .update({ active_brand_id: activeBrandId })
        .eq("id", user.id);
    }
  }

  if (!activeBrandId) {
    console.error("[requireBrand] user has no brand/space:", user.id);
    redirect(
      `/login?error=${encodeURIComponent(
        "No brand was found for this account. Please sign in again."
      )}`
    );
  }

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select(
      "id, company_name, industry, website, logo_url, wallet_balance, marketplace_explored_at"
    )
    .eq("id", activeBrandId)
    .single();

  if (brandError) {
    console.error("[requireBrand] brand fetch failed:", brandError.message);
  }
  if (!brand) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Your active brand could not be loaded. Please sign in again."
      )}`
    );
  }

  return { supabase, user, profile, brand };
}

/**
 * Server-side gate for creator routes. Returns the onboarding row so callers
 * can resume at the right step; `redirectToCurrentStep` enforces it.
 */
export async function requireCreator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("[requireCreator] profile fetch failed:", error.message);
  }

  // Same fail-closed fix as requireBrand — a failed fetch must not be
  // treated as "not a creator, send to brand dashboard".
  if (!profile) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Couldn't load your account. Please sign in again."
      )}`
    );
  }

  if (profile.role !== "creator") redirect("/brand");

  const { data: onboarding } = await supabase
    .from("creator_onboarding")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return {
    supabase,
    user,
    profile,
    onboarding: (onboarding ?? null) as CreatorOnboarding | null,
  };
}

/** Where an in-progress creator should be sent. */
export function onboardingRouteFor(onboarding: CreatorOnboarding | null) {
  if (!onboarding) return "/creator/onboarding/linkedin";
  if (onboarding.completed_at) return null;
  return STEP_ROUTES[onboarding.step] ?? "/creator/onboarding/linkedin";
}
