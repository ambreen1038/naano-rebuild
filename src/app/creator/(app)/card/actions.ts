"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { INDUSTRY_TAGS } from "@/lib/industries";
import { COUNTRIES } from "@/lib/countries";

export async function updateCreatorCard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fail = (msg: string) =>
    redirect(`/creator/card?mode=edit&error=${encodeURIComponent(msg)}`);

  const name = String(formData.get("name") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const followerCountRaw = String(formData.get("follower_count") ?? "").trim();
  const priceRaw = String(formData.get("price_per_post") ?? "").trim();
  const bundleRaw = String(formData.get("bundle_price") ?? "").trim();
  const tags = formData
    .getAll("industry_tags")
    .map((t) => String(t))
    .filter((t) => (INDUSTRY_TAGS as readonly string[]).includes(t));

  if (!name) fail("Your name is required");
  if (!(COUNTRIES as readonly string[]).includes(country))
    fail("Select your country");
  if (tags.length === 0) fail("Pick at least one industry");
  if (tags.length > 3) fail("Pick up to 3 industries");

  const followerCount = Number(followerCountRaw);
  if (!Number.isFinite(followerCount) || followerCount < 0)
    fail("Follower count must be a positive number");

  const pricePerPost = Number(priceRaw);
  if (!Number.isFinite(pricePerPost) || pricePerPost <= 0)
    fail("Enter a price per post");

  const bundlePrice = bundleRaw ? Number(bundleRaw) : null;
  if (bundlePrice !== null && (!Number.isFinite(bundlePrice) || bundlePrice < 0))
    fail("Bundle price must be a positive number");

  const { error } = await supabase
    .from("creators")
    .update({
      name,
      headline,
      avatar_url: avatarUrl || null,
      country,
      follower_count: followerCount,
      price_per_post: pricePerPost,
      bundle_price: bundlePrice,
      industry_tags: tags,
    })
    .eq("user_id", user.id);

  if (error) fail(error.message);

  revalidatePath("/creator", "layout");
  redirect("/creator/card?mode=preview");
}
