"use server";

import { revalidatePath } from "next/cache";
import { requireCreator } from "@/lib/auth/roles";
import type { MessageActionResult } from "@/components/dashboard/messages/types";

const MAX_LENGTH = 2000;

export async function sendCreatorMessage(
  bookingId: string,
  body: string
): Promise<MessageActionResult> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Message can't be empty." };
  if (trimmed.length > MAX_LENGTH) {
    return { ok: false, error: `Keep messages under ${MAX_LENGTH} characters.` };
  }

  const { supabase } = await requireCreator();
  const { error } = await supabase.from("messages").insert({
    booking_id: bookingId,
    sender_role: "creator",
    body: trimmed,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/creator/messages");
  return { ok: true };
}

export async function markCreatorThreadRead(bookingId: string): Promise<void> {
  const { supabase } = await requireCreator();
  await supabase.rpc("mark_messages_read", { p_booking_id: bookingId });
  revalidatePath("/creator/messages");
}
