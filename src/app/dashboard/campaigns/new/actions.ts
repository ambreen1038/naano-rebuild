"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const VERTICALS = [
  "sales-tech",
  "revops",
  "devtools",
  "product",
  "hr-tech",
  "fintech",
  "marketing-ops",
  "vertical-saas",
] as const;

export async function createCampaign(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_brand_id")
    .eq("id", user.id)
    .single();

  if (!profile?.active_brand_id) {
    redirect(
      `/dashboard/campaigns/new?error=${encodeURIComponent(
        "No active brand selected."
      )}`
    );
  }

  const name = String(formData.get("name") ?? "");
  const objective = String(formData.get("objective") ?? "");
  const targetVerticalInput = String(formData.get("target_vertical") ?? "");
  const targetVertical = (VERTICALS as readonly string[]).includes(
    targetVerticalInput
  )
    ? targetVerticalInput
    : null;
  const budgetInput = formData.get("budget");
  const budget = budgetInput ? Number(budgetInput) : null;
  const landingUrl = String(formData.get("landing_url") ?? "") || null;

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      brand_id: profile.active_brand_id,
      name,
      objective,
      target_vertical: targetVertical,
      budget,
      landing_url: landingUrl,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    redirect(
      `/dashboard/campaigns/new?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/dashboard/campaigns/${campaign.id}`);
}
