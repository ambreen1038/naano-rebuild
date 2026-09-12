"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runProductSummaryPipeline } from "@/lib/product-summary";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function switchActiveBrand(brandId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("switch_active_brand", {
    p_brand_id: brandId,
  });
  if (error) return { ok: false, error: error.message };

  redirect("/brand/overview");
}

export async function createBrand(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("company_name") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  if (!name) return { ok: false, error: "Enter a space name." };

  try {
    new URL(website);
  } catch {
    return { ok: false, error: "Enter the space's website, including https://" };
  }

  const supabase = await createClient();
  const { data: brandId, error } = await supabase.rpc("create_brand", {
    p_company_name: name,
    p_website: website,
  });
  if (error) return { ok: false, error: error.message };

  // Best-effort — a failed scan shouldn't block switching into the space.
  await runProductSummaryPipeline(supabase, brandId as string, website);

  redirect("/brand/overview");
}
