import { requireCreator } from "@/lib/auth/roles";
import { AnalyticsClient } from "@/components/dashboard/analytics/AnalyticsClient";

export default async function CreatorAnalyticsPage() {
  const { supabase, user } = await requireCreator();

  const { data: creatorRow } = await supabase
    .from("creators")
    .select("follower_count, median_views")
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

  return (
    <AnalyticsClient
      followerCount={creatorRow.follower_count}
      medianViews={creatorRow.median_views}
    />
  );
}
