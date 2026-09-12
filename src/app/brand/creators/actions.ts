"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

function parseTerms(formData: FormData) {
  const campaignId = String(formData.get("campaign_id") ?? "");
  const postByDate = String(formData.get("post_by_date") ?? "") || null;
  const workModeInput = String(formData.get("work_mode") ?? "specific_brief");
  const workMode = workModeInput === "creative_freedom" ? "creative_freedom" : "specific_brief";
  const approvalInput = String(formData.get("content_approval") ?? "auto");
  const contentApproval = approvalInput === "manual" ? "manual" : "auto";
  return { campaignId, postByDate, workMode, contentApproval };
}

/**
 * Group Selection (bulk invite, one or many creators, all at their own
 * listed rate — no negotiation, so no booking_offers row is created).
 */
export async function createInvites(formData: FormData): Promise<ActionResult> {
  const { campaignId, postByDate, workMode, contentApproval } = parseTerms(formData);
  if (!campaignId) return { ok: false, error: "Choose a campaign for this invitation." };

  const creatorIds = formData.getAll("creator_id").map(String);
  const prices = formData.getAll("price").map((p) => Number(p));
  if (creatorIds.length === 0) return { ok: false, error: "No creators selected." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_booking_invites", {
    p_campaign_id: campaignId,
    p_creator_ids: creatorIds,
    p_prices: prices,
    p_post_by_date: postByDate,
    p_work_mode: workMode,
    p_content_approval: contentApproval,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/brand/collaborations");
  revalidatePath("/brand/creators");
  return { ok: true };
}

/**
 * "Book · €X" from the single-creator selection modal — same terms shape,
 * one creator, at their own listed rate.
 */
export async function createDirectBooking(formData: FormData): Promise<ActionResult> {
  return createInvites(formData);
}

/**
 * "Negotiate" — proposes an amount different from the creator's listed
 * rate, so also opens a real booking_offers thread the creator can see.
 */
export async function createNegotiatedInvite(formData: FormData): Promise<ActionResult> {
  const { campaignId, postByDate, workMode, contentApproval } = parseTerms(formData);
  if (!campaignId) return { ok: false, error: "Choose a campaign for this invitation." };

  const creatorId = String(formData.get("creator_id") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  const message = String(formData.get("message") ?? "").trim() || null;
  if (!creatorId) return { ok: false, error: "No creator selected." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter a valid offer amount." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_negotiated_booking_invite", {
    p_campaign_id: campaignId,
    p_creator_id: creatorId,
    p_amount: amount,
    p_post_by_date: postByDate,
    p_work_mode: workMode,
    p_content_approval: contentApproval,
    p_message: message,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/brand/collaborations");
  revalidatePath("/brand/creators");
  return { ok: true };
}
