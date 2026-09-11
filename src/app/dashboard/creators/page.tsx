import { createClient } from "@/lib/supabase/server";
import { CreatorsClient } from "@/components/dashboard/creators/CreatorsClient";
import { INDUSTRY_TO_TAG } from "@/lib/industry-mapping";

export default async function CreatorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: creators }] = await Promise.all([
    supabase
      .from("profiles")
      .select("company_name, industry")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("creators")
      .select(
        "id, name, headline, vertical, industry_tags, country, follower_count, price_per_post, median_views, cpm, engagement_rate, last_posted_at"
      )
      .order("follower_count", { ascending: false }),
  ]);

  return (
    <CreatorsClient
      creators={creators ?? []}
      companyName={profile?.company_name ?? "there"}
      primaryIndustry={INDUSTRY_TO_TAG[profile?.industry ?? ""] ?? ""}
    />
  );
}
