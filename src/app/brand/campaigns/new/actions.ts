"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { VERTICALS } from "@/lib/verticals";

type ActionResult =
  | { ok: true; campaignId: string }
  | { ok: false; error: string };

/**
 * Returns errors in-band rather than redirecting on failure (the old
 * behavior) — the caller is a client-side multi-step wizard, and a
 * redirect-driven error would reload the page and lose every field the
 * brand already filled in on earlier steps.
 */
export async function createCampaign(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please sign in again." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_brand_id")
    .eq("id", user.id)
    .single();

  if (!profile?.active_brand_id) {
    return { ok: false, error: "No active brand selected." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const objective = String(formData.get("objective") ?? "").trim();
  if (!name) return { ok: false, error: "Campaign name is required." };
  if (!objective) return { ok: false, error: "Objective / brief is required." };

  const keyMessages = String(formData.get("key_messages") ?? "").trim() || null;
  const creatorGuidelines =
    String(formData.get("creator_guidelines") ?? "").trim() || null;

  const targetVerticalInput = String(formData.get("target_vertical") ?? "");
  const targetVertical = (VERTICALS as readonly string[]).includes(
    targetVerticalInput
  )
    ? targetVerticalInput
    : null;

  const budgetInput = formData.get("budget");
  const budget = budgetInput ? Number(budgetInput) : null;
  if (budget != null && (!Number.isFinite(budget) || budget < 0)) {
    return { ok: false, error: "Enter a valid budget." };
  }

  const landingUrlInput = String(formData.get("landing_url") ?? "").trim();
  if (landingUrlInput) {
    try {
      new URL(landingUrlInput);
    } catch {
      return { ok: false, error: "Enter a valid landing page URL." };
    }
  }
  const landingUrl = landingUrlInput || null;

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: profile.active_brand_id,
      name,
      objective,
      key_messages: keyMessages,
      creator_guidelines: creatorGuidelines,
      target_vertical: targetVertical,
      budget,
      landing_url: landingUrl,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  // The Launch Plan's "Create your first brief" step reads straight from
  // the campaigns table, so this is the one place that needs to refresh —
  // no separate progress flag to update.
  revalidatePath("/brand", "layout");
  revalidatePath("/brand/campaigns");

  return { ok: true, campaignId: campaign.id };
}
