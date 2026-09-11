"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MINIMUM_TOP_UP = 500;

export async function addBudget(
  amount: number
): Promise<{ error: string } | { success: true; newBalance: number }> {
  if (!Number.isFinite(amount) || amount < MINIMUM_TOP_UP) {
    return { error: `Minimum top-up is €${MINIMUM_TOP_UP}` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  // Single atomic call (see migration 0008) — the balance update and the
  // invoice row are one Postgres transaction, so a failure can't credit a
  // balance with no invoice to back it, or vice versa.
  const { data: newBalance, error } = await supabase.rpc("add_budget", {
    p_amount: amount,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { success: true, newBalance: Number(newBalance) };
}
