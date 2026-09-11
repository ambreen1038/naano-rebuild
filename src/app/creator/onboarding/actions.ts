"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { INDUSTRY_TAGS } from "@/lib/industries";
import { COUNTRIES } from "@/lib/countries";

const LINKEDIN_URL = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^/\s?]+\/?/i;

async function currentCreator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/**
 * Step 2. Records the creator's public LinkedIn URL and pulls across whatever
 * LinkedIn actually authorised us to have: if they signed in with LinkedIn,
 * Supabase already holds their name and picture from the OIDC token, so we
 * use that. Headline and follower count are NOT in any scope available to us
 * (they need LinkedIn Marketing Partner approval), so they're collected from
 * the creator on the next step rather than invented here.
 */
export async function importLinkedInProfile(formData: FormData) {
  const { supabase, user } = await currentCreator();
  const url = String(formData.get("linkedin_url") ?? "").trim();

  if (!LINKEDIN_URL.test(url)) {
    redirect(
      `/creator/onboarding/linkedin?error=${encodeURIComponent(
        "Enter a valid public LinkedIn profile URL (e.g. https://www.linkedin.com/in/you)"
      )}`
    );
  }

  // `user_metadata` is Supabase's merged view and is normally enough, but
  // `identities[].identity_data` holds the *raw, untouched* claims LinkedIn's
  // OIDC userinfo endpoint returned for this specific identity — a more
  // authoritative source if the two ever disagree. Check both.
  const meta = user.user_metadata ?? {};
  const linkedinIdentity = user.identities?.find(
    (i) => i.provider === "linkedin_oidc"
  );
  const identityData = linkedinIdentity?.identity_data ?? {};

  const oidcName =
    (meta.full_name as string) ||
    (meta.name as string) ||
    (identityData.name as string) ||
    null;
  const oidcAvatar =
    (meta.avatar_url as string) ||
    (meta.picture as string) ||
    (identityData.picture as string) ||
    null;

  // Diagnostic only — this fires if someone signed in via LinkedIn OAuth but
  // we still couldn't find a name/photo, meaning Supabase's claim keys don't
  // match what's checked above. Safe to remove once LinkedIn OAuth is
  // configured and this has been confirmed working against a real account.
  if (user.app_metadata?.provider === "linkedin_oidc" && !oidcName) {
    console.warn(
      "[creator-onboarding] LinkedIn OIDC sign-in but no name found. " +
        "Raw user_metadata keys:",
      Object.keys(meta),
      "Raw identity_data keys:",
      Object.keys(identityData)
    );
  }

  const { error } = await supabase
    .from("creator_onboarding")
    .upsert(
      {
        user_id: user.id,
        linkedin_url: url,
        linkedin_name: oidcName,
        linkedin_avatar_url: oidcAvatar,
        linkedin_imported_at: new Date().toISOString(),
        step: 3,
      },
      { onConflict: "user_id" }
    );

  if (error) {
    redirect(
      `/creator/onboarding/linkedin?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/creator", "layout");
  redirect("/creator/onboarding/profile");
}

/** Step 3. Name, headline, reach, country and up to three industries. */
export async function saveCreatorProfile(formData: FormData) {
  const { supabase, user } = await currentCreator();

  const name = String(formData.get("linkedin_name") ?? "").trim();
  const headline = String(formData.get("linkedin_headline") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const followersRaw = String(formData.get("follower_count") ?? "").trim();
  const tags = formData
    .getAll("industry_tags")
    .map((t) => String(t))
    .filter((t) => (INDUSTRY_TAGS as readonly string[]).includes(t));

  const fail = (msg: string) =>
    redirect(
      `/creator/onboarding/profile?error=${encodeURIComponent(msg)}`
    );

  if (!name) fail("Your name is required");
  if (!(COUNTRIES as readonly string[]).includes(country))
    fail("Select your country");
  if (tags.length === 0) fail("Pick at least one industry");
  if (tags.length > 3) fail("Pick up to 3 industries");

  const followerCount = followersRaw ? Number(followersRaw) : null;
  if (followerCount !== null && (!Number.isFinite(followerCount) || followerCount < 0))
    fail("Follower count must be a positive number");

  const { error } = await supabase
    .from("creator_onboarding")
    .update({
      linkedin_name: name,
      linkedin_headline: headline || null,
      linkedin_follower_count: followerCount,
      country,
      industry_tags: tags,
      step: 4,
    })
    .eq("user_id", user.id);

  if (error) fail(error.message);

  revalidatePath("/creator", "layout");
  redirect("/creator/onboarding/price");
}

/** Step 4. Price, then create the live marketplace card in one transaction. */
export async function completeOnboarding(formData: FormData) {
  const { supabase, user } = await currentCreator();
  const price = Number(formData.get("price_per_post") ?? 0);

  const fail = (msg: string) =>
    redirect(`/creator/onboarding/price?error=${encodeURIComponent(msg)}`);

  if (!Number.isFinite(price) || price <= 0) fail("Enter a price per post");

  const { error: saveError } = await supabase
    .from("creator_onboarding")
    .update({ price_per_post: price })
    .eq("user_id", user.id);
  if (saveError) fail(saveError.message);

  const { error: completeError } = await supabase.rpc(
    "complete_creator_onboarding"
  );
  if (completeError) fail(completeError.message);

  revalidatePath("/creator", "layout");
  redirect("/creator/onboarding/success");
}
