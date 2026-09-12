"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["invited", "draft", "scheduled", "live", "completed", "declined"];

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateBookingStatus(bookingId: string, status: string) {
  if (!VALID_STATUSES.includes(status)) return;

  const supabase = await createClient();
  const update: Record<string, unknown> = { status };
  if (status === "live") update.published_at = new Date().toISOString();

  await supabase.from("bookings").update(update).eq("id", bookingId);
  revalidatePath("/brand/collaborations");
}

/** Brand accepts/declines the creator's current counter-offer. */
export async function respondToOffer(
  bookingId: string,
  response: "accept" | "decline"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("brand_respond_to_offer", {
    p_booking_id: bookingId,
    p_response: response,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/brand/collaborations");
  revalidatePath("/creator/collaborations");
  return { ok: true };
}

/** Brand proposes a new amount in response to the creator's counter. */
export async function counterOffer(
  bookingId: string,
  amount: number,
  message: string | null
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("brand_counter_offer", {
    p_booking_id: bookingId,
    p_amount: amount,
    p_message: message,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/brand/collaborations");
  revalidatePath("/creator/collaborations");
  return { ok: true };
}

/** Brand accepts/declines a creator-initiated campaign application. */
export async function respondToApplication(
  applicationId: string,
  response: "accepted" | "declined"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_campaign_application", {
    p_application_id: applicationId,
    p_response: response,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/brand/collaborations");
  return { ok: true };
}
