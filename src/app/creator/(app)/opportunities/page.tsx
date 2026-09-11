import { requireCreator } from "@/lib/auth/roles";
import { computeCampaignMatch } from "@/lib/campaign-match";
import {
  OpportunitiesClient,
  type OpportunityCampaignWithMatch,
} from "@/components/dashboard/opportunities/OpportunitiesClient";

type RawCampaign = {
  id: string;
  name: string;
  objective: string | null;
  target_vertical: string | null;
  channel: string;
  target_regions: string[];
  budget: number | string | null;
  application_deadline: string | null;
  target_audience: string | null;
  cta_do: string | null;
  cta_dont: string | null;
  tone: string | null;
  content_angles: string[];
  created_at: string;
  brand: {
    company_name: string | null;
    website: string | null;
    logo_url: string | null;
  } | null;
};

export default async function OpportunitiesPage() {
  const { supabase, user } = await requireCreator();

  const { data: creatorRow } = await supabase
    .from("creators")
    .select(
      "id, industry_tags, price_per_post, bundle_price, country, billing_setup_completed_at"
    )
    .eq("user_id", user.id)
    .single();

  if (!creatorRow) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500">
          Your marketplace card hasn&apos;t been created yet.
        </p>
      </div>
    );
  }

  const creatorForMatch = {
    industry_tags: creatorRow.industry_tags,
    country: creatorRow.country,
    price_per_post: Number(creatorRow.price_per_post),
    bundle_price:
      creatorRow.bundle_price != null ? Number(creatorRow.bundle_price) : null,
  };

  const [{ data: bookingsData }, { data: applicationsData }, { data: campaignsData }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("campaign_id")
        .eq("creator_id", creatorRow.id),
      supabase
        .from("campaign_applications")
        .select("campaign_id")
        .eq("creator_id", creatorRow.id),
      supabase
        .from("campaigns")
        .select(
          "id, name, objective, target_vertical, channel, target_regions, budget, application_deadline, target_audience, cta_do, cta_dont, tone, content_angles, created_at, brand:brands(company_name, website, logo_url)"
        )
        .eq("status", "active"),
    ]);

  const bookedCampaignIds = new Set(
    (bookingsData ?? []).map((b) => b.campaign_id as string)
  );
  const appliedCampaignIds = (applicationsData ?? []).map(
    (a) => a.campaign_id as string
  );

  const campaigns = (
    (campaignsData ?? []) as unknown as RawCampaign[]
  ).filter((c) => !bookedCampaignIds.has(c.id));

  const withMatch: OpportunityCampaignWithMatch[] = campaigns.map((c) => {
    const budget = c.budget != null ? Number(c.budget) : null;
    const result = computeCampaignMatch(creatorForMatch, {
      target_vertical: c.target_vertical,
      target_regions: c.target_regions,
      budget,
      channel: c.channel,
    });
    return {
      ...c,
      budget,
      match: result.score,
      matchTier: result.tier,
      matchFactors: result.factors,
    };
  });

  return (
    <OpportunitiesClient
      campaigns={withMatch}
      creatorTags={creatorRow.industry_tags}
      netAmount={creatorForMatch.bundle_price ?? creatorForMatch.price_per_post}
      registrationCountryDefault={creatorRow.country}
      initialBillingSetupCompleted={creatorRow.billing_setup_completed_at !== null}
      initialAppliedCampaignIds={appliedCampaignIds}
    />
  );
}
