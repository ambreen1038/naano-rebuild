import { INDUSTRY_TO_TAG } from "@/lib/industry-mapping";
import { channelLabel } from "@/lib/channel-label";

// Every factor here is derived from a real, already-collected column —
// nothing here is guessed or randomized. Two fields that exist on
// `creators` (median_views, cpm, engagement_rate, last_posted_at) are
// deliberately NOT scored: no onboarding step or edit form ever writes
// them, so today they are always null for every real creator. Scoring
// against a column nobody populates would be indistinguishable from
// making the number up. If a future step starts collecting them, add a
// factor for them here rather than fabricating one now.
//
// Factor weights (sum to 100):
//   Industry match    45 — campaign.target_vertical bridged to the
//                          creator's industry_tags vocabulary.
//   Location fit       20 — campaign.target_regions vs creator.country.
//   Budget fit         20 — campaign.budget vs the creator's own rate.
//   Channel fit        15 — campaign.channel vs what the platform can
//                          actually verify for a creator today (LinkedIn
//                          only — there is no Twitter onboarding path).
//
// A field left unset by the brand (no target_vertical / no target_regions
// / no budget) is treated as "not restricted," not as a mismatch: it
// awards full points for that factor rather than guessing what the brand
// meant. A field that IS set and doesn't fit awards zero for that factor,
// with a plain-language reason attached so the creator can see exactly
// why.

export type MatchFactorKey = "industry" | "location" | "budget" | "channel";

export type MatchFactor = {
  key: MatchFactorKey;
  label: string;
  points: number;
  maxPoints: number;
  reason: string;
};

export type MatchTier = "strong" | "partial" | "limited";

export type MatchResult = {
  score: number;
  tier: MatchTier;
  factors: MatchFactor[];
};

const WEIGHTS: Record<MatchFactorKey, number> = {
  industry: 45,
  location: 20,
  budget: 20,
  channel: 15,
};

export type MatchCreator = {
  industry_tags: string[];
  country: string | null;
  price_per_post: number;
  bundle_price: number | null;
};

export type MatchCampaign = {
  target_vertical: string | null;
  target_regions: string[];
  budget: number | null;
  channel: string;
};

export function computeCampaignMatch(
  creator: MatchCreator,
  campaign: MatchCampaign
): MatchResult {
  const factors: MatchFactor[] = [];

  // --- Industry match -------------------------------------------------
  const mappedTag = campaign.target_vertical
    ? INDUSTRY_TO_TAG[campaign.target_vertical]
    : undefined;

  if (!campaign.target_vertical) {
    factors.push({
      key: "industry",
      label: "Industry",
      points: WEIGHTS.industry,
      maxPoints: WEIGHTS.industry,
      reason:
        "This campaign didn't specify a target industry, so it's open to any creator.",
    });
  } else if (mappedTag && creator.industry_tags.includes(mappedTag)) {
    factors.push({
      key: "industry",
      label: "Industry",
      points: WEIGHTS.industry,
      maxPoints: WEIGHTS.industry,
      reason: `Your "${mappedTag}" industry tag matches this campaign's target industry.`,
    });
  } else {
    factors.push({
      key: "industry",
      label: "Industry",
      points: 0,
      maxPoints: WEIGHTS.industry,
      reason: mappedTag
        ? `This campaign targets "${mappedTag}", which isn't one of your industry tags.`
        : "This campaign's target industry doesn't match any of your industry tags.",
    });
  }

  // --- Location fit -----------------------------------------------------
  if (campaign.target_regions.length === 0) {
    factors.push({
      key: "location",
      label: "Location",
      points: WEIGHTS.location,
      maxPoints: WEIGHTS.location,
      reason: "This campaign didn't restrict by region, so it's open to any location.",
    });
  } else if (creator.country && campaign.target_regions.includes(creator.country)) {
    factors.push({
      key: "location",
      label: "Location",
      points: WEIGHTS.location,
      maxPoints: WEIGHTS.location,
      reason: `Your country (${creator.country}) is one of this campaign's target regions.`,
    });
  } else {
    factors.push({
      key: "location",
      label: "Location",
      points: 0,
      maxPoints: WEIGHTS.location,
      reason: `This campaign targets ${campaign.target_regions.join(
        ", "
      )}, which doesn't include your country${
        creator.country ? ` (${creator.country})` : " (not set on your profile)"
      }.`,
    });
  }

  // --- Budget fit -------------------------------------------------------
  const rate = creator.bundle_price ?? creator.price_per_post;
  if (campaign.budget == null) {
    factors.push({
      key: "budget",
      label: "Budget",
      points: WEIGHTS.budget,
      maxPoints: WEIGHTS.budget,
      reason: "This campaign hasn't set a budget cap yet.",
    });
  } else if (rate <= campaign.budget) {
    factors.push({
      key: "budget",
      label: "Budget",
      points: WEIGHTS.budget,
      maxPoints: WEIGHTS.budget,
      reason: `Your rate (€${rate}) fits within this campaign's budget (€${campaign.budget}).`,
    });
  } else {
    factors.push({
      key: "budget",
      label: "Budget",
      points: 0,
      maxPoints: WEIGHTS.budget,
      reason: `Your rate (€${rate}) exceeds this campaign's budget (€${campaign.budget}).`,
    });
  }

  // --- Channel fit --------------------------------------------------------
  if (campaign.channel === "linkedin") {
    factors.push({
      key: "channel",
      label: "Channel",
      points: WEIGHTS.channel,
      maxPoints: WEIGHTS.channel,
      reason: "This campaign runs on LinkedIn, which matches your creator profile.",
    });
  } else {
    factors.push({
      key: "channel",
      label: "Channel",
      points: 0,
      maxPoints: WEIGHTS.channel,
      reason: `This campaign runs on ${channelLabel(
        campaign.channel
      )}, and your creator profile is LinkedIn-only today.`,
    });
  }

  const score = factors.reduce((sum, f) => sum + f.points, 0);
  const tier: MatchTier = score >= 80 ? "strong" : score >= 50 ? "partial" : "limited";

  return { score, tier, factors };
}

export const MATCH_TIER_LABEL: Record<MatchTier, string> = {
  strong: "Strong match",
  partial: "Partial match",
  limited: "Limited match",
};
