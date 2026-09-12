"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { INDUSTRY_TAGS } from "@/lib/industries";
import { COUNTRIES } from "@/lib/countries";

type ActionResult = { ok: true } | { ok: false; error: string };

async function currentCreator() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null as null };
  return { supabase, user };
}

export async function updateProfileDetails(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await currentCreator();
  if (!user) return { ok: false, error: "Not signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const about = String(formData.get("about") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const followerCountRaw = String(formData.get("follower_count") ?? "").trim();
  const tags = formData
    .getAll("industry_tags")
    .map((t) => String(t))
    .filter((t) => (INDUSTRY_TAGS as readonly string[]).includes(t));

  if (!name) return { ok: false, error: "Your name is required." };
  if (!(COUNTRIES as readonly string[]).includes(country)) {
    return { ok: false, error: "Select your country." };
  }
  if (tags.length === 0) return { ok: false, error: "Pick at least one industry." };
  if (tags.length > 3) return { ok: false, error: "Pick up to 3 industries." };

  const followerCount = Number(followerCountRaw);
  if (!Number.isFinite(followerCount) || followerCount < 0) {
    return { ok: false, error: "Follower count must be a positive number." };
  }

  const { error } = await supabase
    .from("creators")
    .update({
      name,
      headline,
      about: about || null,
      country,
      follower_count: followerCount,
      industry_tags: tags,
    })
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator", "layout");
  return { ok: true };
}

export async function updatePricingAndBundle(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await currentCreator();
  if (!user) return { ok: false, error: "Not signed in." };

  const priceRaw = String(formData.get("price_per_post") ?? "").trim();
  const bundlePriceRaw = String(formData.get("bundle_price") ?? "").trim();
  const bundleCountRaw = String(formData.get("bundle_post_count") ?? "").trim();

  const pricePerPost = Number(priceRaw);
  if (!Number.isFinite(pricePerPost) || pricePerPost <= 0) {
    return { ok: false, error: "Enter a valid price per post." };
  }

  let bundlePrice: number | null = null;
  let bundlePostCount: number | null = null;
  if (bundlePriceRaw || bundleCountRaw) {
    bundlePrice = Number(bundlePriceRaw);
    bundlePostCount = Number(bundleCountRaw);
    if (!Number.isFinite(bundlePrice) || bundlePrice < 0) {
      return { ok: false, error: "Enter a valid bundle price." };
    }
    if (!Number.isInteger(bundlePostCount) || bundlePostCount <= 0) {
      return { ok: false, error: "Enter a valid number of posts for the bundle." };
    }
  }

  const { error } = await supabase
    .from("creators")
    .update({
      price_per_post: pricePerPost,
      bundle_price: bundlePrice,
      bundle_post_count: bundlePostCount,
    })
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator", "layout");
  return { ok: true };
}

/** Persists the avatar URL after the file itself is already uploaded to
 * Storage client-side (see ChangePhotoModal) — Storage RLS already scopes
 * the upload to the caller's own folder, this just updates the row. */
export async function updateAvatarUrl(url: string | null): Promise<ActionResult> {
  const { supabase, user } = await currentCreator();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("creators")
    .update({ avatar_url: url })
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator", "layout");
  return { ok: true };
}

type Section = "about" | "metrics" | "pricing";

export async function toggleSectionVisibility(
  section: Section,
  hidden: boolean
): Promise<ActionResult> {
  const { supabase, user } = await currentCreator();
  if (!user) return { ok: false, error: "Not signed in." };

  const column =
    section === "about"
      ? "about_hidden"
      : section === "metrics"
        ? "metrics_hidden"
        : "pricing_hidden";

  const { error } = await supabase
    .from("creators")
    .update({ [column]: hidden })
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator", "layout");
  return { ok: true };
}
