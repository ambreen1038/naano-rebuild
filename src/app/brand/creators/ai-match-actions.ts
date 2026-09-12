"use server";

import { requireBrand } from "@/lib/auth/roles";
import { MOCK_CREATORS } from "@/lib/mock-creators";
import { runAiCreatorMatch, type MatchedCreator } from "@/lib/ai-creator-matching";
import type { Creator } from "@/components/dashboard/creators/CreatorsClient";

type ActionResult =
  | { ok: true; summary: string; matches: MatchedCreator[] }
  | { ok: false; error: string };

const MIN_QUERY_LENGTH = 5;
const MAX_QUERY_LENGTH = 300;

export async function matchCreatorsWithAI(query: string): Promise<ActionResult> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return { ok: false, error: "Describe what you're looking for in a bit more detail." };
  }
  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { ok: false, error: `Keep your request under ${MAX_QUERY_LENGTH} characters.` };
  }

  const { supabase, brand } = await requireBrand();

  const { data: realCreators, error } = await supabase
    .from("creators")
    .select(
      "id, name, headline, vertical, industry_tags, country, follower_count, price_per_post, median_views, cpm, engagement_rate, last_posted_at, linkedin_url, avatar_url, bundle_price"
    )
    .not("user_id", "is", null)
    .order("follower_count", { ascending: false });

  if (error) {
    return { ok: false, error: `Couldn't load creators: ${error.message}` };
  }

  // Same real+mock pool the Creators tab's Marketplace view shows — so a
  // matched creator is always one that's actually clickable there too.
  const creators: Creator[] = [...(realCreators ?? []), ...MOCK_CREATORS];

  const { data: fullBrand } = await supabase
    .from("brands")
    .select("product_summary, product_features")
    .eq("id", brand.id)
    .single();

  const result = await runAiCreatorMatch(
    trimmed,
    {
      companyName: brand.company_name || "your company",
      industry: brand.industry,
      productSummary: fullBrand?.product_summary ?? null,
      productFeatures: fullBrand?.product_features ?? [],
    },
    creators
  );

  if (!result) {
    return {
      ok: false,
      error:
        "AI Matching isn't available right now — this could be a missing configuration, a rate limit, or a temporary issue. Please try again shortly.",
    };
  }

  return { ok: true, summary: result.summary, matches: result.matches };
}
