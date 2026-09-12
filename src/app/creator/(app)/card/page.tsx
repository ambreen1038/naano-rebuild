import { requireCreator } from "@/lib/auth/roles";
import { MyCardClient, type CreatorCardData } from "@/components/dashboard/creator-card/MyCardClient";

export default async function MyCardPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const { supabase, user } = await requireCreator();

  const { data: creator } = await supabase
    .from("creators")
    .select(
      "name, headline, about, avatar_url, country, follower_count, price_per_post, bundle_price, bundle_post_count, industry_tags, about_hidden, metrics_hidden, pricing_hidden, linkedin_url, linkedin_refreshed_at"
    )
    .eq("user_id", user.id)
    .single();

  if (!creator) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500">
          Your marketplace card hasn&apos;t been created yet.
        </p>
      </div>
    );
  }

  return (
    <MyCardClient
      mode={mode === "edit" ? "edit" : "preview"}
      creator={creator as CreatorCardData}
    />
  );
}
