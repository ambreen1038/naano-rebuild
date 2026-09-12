"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { INDUSTRY_TAGS } from "@/lib/industries";

type ActionResult = { ok: true } | { ok: false; error: string };

const REFRESH_COOLDOWN_DAYS = 7;
const IBAN_PATTERN = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;

async function currentCreator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null as null };
  return { supabase, user };
}

export async function updateDisplayName(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await currentCreator();
  if (!user) return { ok: false, error: "Not signed in." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name can't be empty." };

  const { error } = await supabase
    .from("creators")
    .update({ name })
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator", "layout");
  return { ok: true };
}

/**
 * Saves the LinkedIn/X links and industries shown in the Profile tab.
 * Distinct from `refreshLinkedInProfile` below — this just persists
 * whatever's currently typed, no re-import from LinkedIn's identity data.
 */
export async function saveProfileSettings(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await currentCreator();
  if (!user) return { ok: false, error: "Not signed in." };

  const linkedinUrl = String(formData.get("linkedin_url") ?? "").trim() || null;
  const twitterUrl = String(formData.get("twitter_url") ?? "").trim() || null;
  const tags = formData
    .getAll("industry_tags")
    .map((t) => String(t))
    .filter((t) => (INDUSTRY_TAGS as readonly string[]).includes(t));

  if (linkedinUrl) {
    try {
      new URL(linkedinUrl);
    } catch {
      return { ok: false, error: "Enter a valid LinkedIn URL." };
    }
  }
  if (twitterUrl) {
    try {
      new URL(twitterUrl);
    } catch {
      return { ok: false, error: "Enter a valid X (Twitter) URL." };
    }
  }
  if (tags.length === 0) return { ok: false, error: "Pick at least one industry." };
  if (tags.length > 3) return { ok: false, error: "Pick up to 3 industries." };

  const { error } = await supabase
    .from("creators")
    .update({
      linkedin_url: linkedinUrl,
      twitter_url: twitterUrl,
      industry_tags: tags,
    })
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator", "layout");
  return { ok: true };
}

/**
 * Re-pulls whatever LinkedIn's OIDC identity actually authorized (name,
 * photo) — the same source `importLinkedInProfile` uses at onboarding.
 * There is no follower-count or post-reading access (that needs LinkedIn's
 * gated Marketing Developer Platform), so this never touches those fields
 * — only what's genuinely re-fetchable, rate-limited so it can't be spammed.
 */
export async function refreshLinkedInProfile(): Promise<ActionResult> {
  const { supabase, user } = await currentCreator();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: creator } = await supabase
    .from("creators")
    .select("linkedin_refreshed_at")
    .eq("user_id", user.id)
    .single();

  if (creator?.linkedin_refreshed_at) {
    const last = new Date(creator.linkedin_refreshed_at).getTime();
    const cooldownMs = REFRESH_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    const remainingMs = last + cooldownMs - Date.now();
    if (remainingMs > 0) {
      const days = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      return {
        ok: false,
        error: `You can refresh again in ${days} day${days === 1 ? "" : "s"}.`,
      };
    }
  }

  const linkedinIdentity = user.identities?.find((i) => i.provider === "linkedin_oidc");
  const identityData = linkedinIdentity?.identity_data ?? {};
  const meta = user.user_metadata ?? {};

  const oidcName =
    (meta.full_name as string) || (meta.name as string) || (identityData.name as string) || null;
  const oidcAvatar =
    (meta.avatar_url as string) ||
    (meta.picture as string) ||
    (identityData.picture as string) ||
    null;

  if (!oidcName && !oidcAvatar) {
    return {
      ok: false,
      error:
        "Nothing to refresh — sign in with LinkedIn to let Naano pull your name and photo automatically.",
    };
  }

  const update: Record<string, unknown> = { linkedin_refreshed_at: new Date().toISOString() };
  if (oidcName) update.name = oidcName;
  if (oidcAvatar) update.avatar_url = oidcAvatar;

  const { error } = await supabase.from("creators").update(update).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator", "layout");
  return { ok: true };
}

export async function saveBankDetails(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await currentCreator();
  if (!user) return { ok: false, error: "Not signed in." };

  const accountHolder = String(formData.get("bank_account_holder") ?? "").trim();
  const iban = String(formData.get("bank_iban") ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const bankName = String(formData.get("bank_name") ?? "").trim();

  if (!accountHolder) return { ok: false, error: "Enter the account holder's name." };
  if (!IBAN_PATTERN.test(iban)) return { ok: false, error: "Enter a valid IBAN." };
  if (!bankName) return { ok: false, error: "Enter the bank name." };

  const { error } = await supabase
    .from("creators")
    .update({
      bank_account_holder: accountHolder,
      bank_iban: iban,
      bank_name: bankName,
    })
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator/settings");
  return { ok: true };
}

/**
 * Permanent, real deletion — not a soft-delete flag. Removing the
 * auth.users row cascades to profiles/creators/creator_onboarding (all
 * `on delete cascade`), so this one call is genuinely "all associated
 * data," not just this table. Requires the service-role client: a normal
 * user session can't call the Admin API to delete itself.
 */
export async function deleteAccount(): Promise<ActionResult> {
  const { supabase, user } = await currentCreator();
  if (!user) return { ok: false, error: "Not signed in." };

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, error: error.message };

  await supabase.auth.signOut();
  redirect("/");
}
