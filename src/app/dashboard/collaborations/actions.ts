"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["draft", "scheduled", "live", "completed"];

export async function updateBookingStatus(bookingId: string, status: string) {
  if (!VALID_STATUSES.includes(status)) return;

  const supabase = await createClient();
  const update: Record<string, unknown> = { status };
  if (status === "live") update.published_at = new Date().toISOString();

  await supabase.from("bookings").update(update).eq("id", bookingId);
  revalidatePath("/dashboard/collaborations");
}
