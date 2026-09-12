import type { SupabaseClient } from "@supabase/supabase-js";

export type LaunchPlanStep = {
  key: "marketplace" | "brief" | "booking";
  title: string;
  description: string;
  done: boolean;
  href: string;
  doneVerb: string;
  pendingVerb: string;
};

export type LaunchPlanStatus = {
  steps: LaunchPlanStep[];
  completedCount: number;
  totalCount: number;
};

/**
 * Completion for each Launch Plan step is derived from real rows the brand
 * already has — a campaign, a booking — except "explored the marketplace",
 * which has no table of its own, so it's the one honest timestamp added in
 * migration 0019 (set server-side the first time /brand/creators loads).
 * Nothing here is a fabricated or client-toggled progress flag.
 */
export async function getLaunchPlanStatus(
  supabase: SupabaseClient,
  marketplaceExploredAt: string | null
): Promise<LaunchPlanStatus> {
  const { data: campaigns } = await supabase.from("campaigns").select("id");
  const campaignIds = (campaigns ?? []).map((c) => (c as { id: string }).id);

  let bookingCount = 0;
  if (campaignIds.length > 0) {
    const { count } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("campaign_id", campaignIds);
    bookingCount = count ?? 0;
  }

  const briefDone = campaignIds.length > 0;
  const bookingDone = bookingCount > 0;

  const steps: LaunchPlanStep[] = [
    {
      key: "marketplace",
      title: "Discover the Marketplace",
      description:
        "Compare your matched creators by sector, reach, performance and price.",
      done: marketplaceExploredAt != null,
      href: "/brand/creators",
      doneVerb: "Done",
      pendingVerb: "Explore",
    },
    {
      key: "brief",
      title: "Create your first brief",
      description:
        "Open the guided editor and turn your campaign goal into creator-ready instructions.",
      done: briefDone,
      href: briefDone ? "/brand/campaigns" : "/brand/campaigns/new",
      doneVerb: "Done",
      pendingVerb: "Write your brief",
    },
    {
      key: "booking",
      title: "Book or negotiate with a creator",
      description:
        "Choose an offer, negotiate if needed, and send your first funded invitation.",
      done: bookingDone,
      href: bookingDone ? "/brand/collaborations" : "/brand/creators",
      doneVerb: "Done",
      pendingVerb: "Choose creator",
    },
  ];

  return {
    steps,
    completedCount: steps.filter((s) => s.done).length,
    totalCount: steps.length,
  };
}
