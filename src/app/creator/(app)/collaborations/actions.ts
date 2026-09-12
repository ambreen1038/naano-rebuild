"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function respondToInvite(
  bookingId: string,
  response: "accept" | "decline"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_booking_invite", {
    p_booking_id: bookingId,
    p_response: response,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator/collaborations");
  revalidatePath("/creator");
  return { ok: true };
}

export async function counterOffer(
  bookingId: string,
  amount: number,
  message: string | null
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("creator_counter_offer", {
    p_booking_id: bookingId,
    p_amount: amount,
    p_message: message,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator/collaborations");
  revalidatePath("/brand/collaborations");
  return { ok: true };
}
