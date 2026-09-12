"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { VERTICALS } from "@/lib/verticals";

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * RLS ("campaigns: brand can manage own", migration 0015) already scopes
 * every one of these to campaigns under the caller's active brand — no
 * explicit brand_id check needed here, a mismatched id just matches zero
 * rows.
 */
export async function updateCampaign(
  campaignId: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

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

  const { error } = await supabase
    .from("campaigns")
    .update({
      name,
      objective,
      key_messages: keyMessages,
      creator_guidelines: creatorGuidelines,
      target_vertical: targetVertical,
      budget,
      landing_url: landingUrl,
    })
    .eq("id", campaignId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/brand/campaigns/${campaignId}`);
  revalidatePath("/brand/campaigns");
  return { ok: true };
}

export async function setCampaignStatus(
  campaignId: string,
  status: "active" | "draft" | "completed"
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("campaigns")
    .update({ status })
    .eq("id", campaignId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/brand/campaigns/${campaignId}`);
  revalidatePath("/brand/campaigns");
  return { ok: true };
}

/**
 * Only allowed with zero bookings — `bookings.campaign_id` cascades on
 * delete (migration 0001), so deleting a campaign with real collaborations
 * would silently wipe them. Mark it completed instead in that case.
 */
export async function deleteCampaign(campaignId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error:
        "This campaign has bookings and can't be deleted — mark it as completed instead.",
    };
  }

  const { error } = await supabase.from("campaigns").delete().eq("id", campaignId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/brand/campaigns");
  return { ok: true };
}
