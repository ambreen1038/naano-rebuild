"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { INDUSTRY_TO_TAG } from "@/lib/industry-mapping";

export async function createBooking(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const creatorId = String(formData.get("creator_id") ?? "");
  const campaignId = String(formData.get("campaign_id") ?? "");
  const priceAgreed = Number(formData.get("price_agreed") ?? 0);
  const scheduledDate = String(formData.get("scheduled_date") ?? "") || null;

  const [{ data: creator }, { data: campaign }] = await Promise.all([
    supabase
      .from("creators")
      .select("industry_tags")
      .eq("id", creatorId)
      .single(),
    supabase
      .from("campaigns")
      .select("target_vertical")
      .eq("id", campaignId)
      .single(),
  ]);

  const targetTag = campaign?.target_vertical
    ? INDUSTRY_TO_TAG[campaign.target_vertical]
    : null;
  const fitScore =
    targetTag && creator?.industry_tags?.includes(targetTag) ? 90 : 60;

  const { error } = await supabase.from("bookings").insert({
    campaign_id: campaignId,
    creator_id: creatorId,
    price_agreed: priceAgreed,
    fit_score: fitScore,
    scheduled_date: scheduledDate,
    status: "draft",
  });

  if (error) {
    redirect(
      `/dashboard/creators/${creatorId}/book?error=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect("/dashboard/collaborations");
}
