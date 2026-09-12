import { requireBrand } from "@/lib/auth/roles";
import { CreatorsClient } from "@/components/dashboard/creators/CreatorsClient";
import { INDUSTRY_TO_TAG } from "@/lib/industry-mapping";
import { MOCK_CREATORS } from "@/lib/mock-creators";

export default async function CreatorsPage() {
  const { supabase, brand } = await requireBrand();

  // Only creators who actually completed Creator Portal onboarding have a
  // user_id (set atomically by complete_creator_onboarding()). Rows with no
  // user_id are the fictional demo creators from supabase/seed.sql, not
  // real signups — excluded here, not hidden via a separate RLS rule, since
  // this is a "which of these are real" business filter, not an
  // authorization boundary.
  const [{ data: creators, error }, { data: campaigns }] = await Promise.all([
    supabase
      .from("creators")
      .select(
        "id, name, headline, vertical, industry_tags, country, follower_count, price_per_post, median_views, cpm, engagement_rate, last_posted_at, linkedin_url, avatar_url, bundle_price"
      )
      .not("user_id", "is", null)
      .order("follower_count", { ascending: false }),
    supabase
      .from("campaigns")
      .select("id, name")
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  if (error) {
    return (
      <div className="p-8">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Couldn&apos;t load creators: {error.message}
        </p>
      </div>
    );
  }

  // MOCK_CREATORS (src/lib/mock-creators.ts) is test-only data standing in
  // for a fuller marketplace while real signups are still sparse — kept in
  // its own file, never referenced by any UI component directly, so it can
  // be deleted along with this one line whenever it's no longer needed.
  const allCreators = [...(creators ?? []), ...MOCK_CREATORS];

  return (
    <CreatorsClient
      creators={allCreators}
      companyName={brand.company_name || "there"}
      primaryIndustry={INDUSTRY_TO_TAG[brand.industry ?? ""] ?? ""}
      campaigns={campaigns ?? []}
    />
  );
}
