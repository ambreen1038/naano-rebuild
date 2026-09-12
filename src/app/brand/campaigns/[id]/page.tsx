import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, name, objective, creator_guidelines, target_vertical, budget, landing_url, status, created_at"
    )
    .eq("id", id)
    .single();

  if (!campaign) {
    notFound();
  }

  return (
    <div className="p-8">
      <Link
        href="/brand/campaigns"
        className="text-sm text-zinc-500 hover:underline"
      >
        ← Back to campaigns
      </Link>
      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {campaign.name}
        </h1>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          {campaign.status}
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-500">
          Objective / brief
        </h2>
        <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
          {campaign.objective}
        </p>

        {campaign.creator_guidelines && (
          <>
            <h2 className="mt-4 text-sm font-semibold text-zinc-500">
              Creator guidelines
            </h2>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
              {campaign.creator_guidelines}
            </p>
          </>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-zinc-500">Target vertical</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {campaign.target_vertical ?? "Any"}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Budget</p>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">
              {campaign.budget ? `€${campaign.budget}` : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Landing URL</p>
            <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
              {campaign.landing_url ?? "Not set"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-zinc-500">
        Booking creators into this campaign happens from the Collaborations
        tab — coming next.
      </p>
    </div>
  );
}
