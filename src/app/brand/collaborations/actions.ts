"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_BOOKING_TRANSITIONS, BOOKING_STATUSES, type BookingStatus } from "@/lib/booking-status";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateBookingStatus(
  bookingId: string,
  status: string
): Promise<ActionResult> {
  if (!(BOOKING_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  const supabase = await createClient();

  // `invited`/`declined` are only ever reached via the creator's own
  // respond_to_booking_invite RPC — this brand-facing control can't jump a
  // booking there directly, or move it out of a terminal state.
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", bookingId)
    .single();
  if (fetchError || !booking) return { ok: false, error: "Booking not found." };

  const allowedNext = ALLOWED_BOOKING_TRANSITIONS[booking.status as BookingStatus] ?? [];
  if (!allowedNext.includes(status as BookingStatus)) {
    return {
      ok: false,
      error: `Can't move a booking from "${booking.status}" to "${status}" here.`,
    };
  }

  const update: Record<string, unknown> = { status };
  if (status === "live") update.published_at = new Date().toISOString();

  const { error } = await supabase.from("bookings").update(update).eq("id", bookingId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/brand/collaborations");
  revalidatePath("/creator/collaborations");
  return { ok: true };
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
