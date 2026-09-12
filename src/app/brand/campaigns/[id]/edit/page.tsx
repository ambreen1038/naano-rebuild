import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditCampaignForm } from "@/components/dashboard/campaigns/EditCampaignForm";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, name, objective, key_messages, creator_guidelines, target_vertical, budget, landing_url"
    )
    .eq("id", id)
    .single();

  if (!campaign) {
    notFound();
  }

  return <EditCampaignForm campaign={campaign} />;
}
