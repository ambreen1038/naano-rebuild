import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC",
];

function formatCreatedOn(iso: string) {
  const d = new Date(iso);
  return `CREATED ON ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
];

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeTab = status && ["active", "draft", "completed"].includes(status)
    ? status
    : "all";

  const supabase = await createClient();

  let query = supabase
    .from("campaigns")
    .select("id, name, objective, status, created_at")
    .order("created_at", { ascending: false });

  if (activeTab !== "all") {
    query = query.eq("status", activeTab);
  }

  const { data: campaigns } = await query;
  const campaignIds = (campaigns ?? []).map((c) => c.id);

  const { data: bookings } =
    campaignIds.length > 0
      ? await supabase
          .from("bookings")
          .select("campaign_id, creator_id, status, price_agreed")
          .in("campaign_id", campaignIds)
      : { data: [] as { campaign_id: string; creator_id: string; status: string; price_agreed: number }[] };

  const statsFor = (campaignId: string) => {
    const rows = (bookings ?? []).filter((b) => b.campaign_id === campaignId);
    const creators = new Set(rows.map((r) => r.creator_id)).size;
    const published = rows.filter((r) =>
      ["live", "completed"].includes(r.status)
    ).length;
    const committedBudget = rows.reduce(
      (sum, r) => sum + Number(r.price_agreed),
      0
    );
    return { creators, published, committedBudget };
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Campaigns
        </h1>
        <Link
          href="/brand/campaigns/new"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create a campaign
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
          {TABS.map((tab) => (
            <Link
              key={tab.value}
              href={
                tab.value === "all"
                  ? "/brand/campaigns"
                  : `/brand/campaigns?status=${tab.value}`
              }
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <span className="text-sm text-zinc-500">
          {(campaigns ?? []).length} campaigns
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {(campaigns ?? []).map((campaign) => {
          const { creators, published, committedBudget } = statsFor(
            campaign.id
          );
          return (
            <div
              key={campaign.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="relative h-28 bg-gradient-to-br from-teal-100 to-sky-100 p-4 dark:from-teal-950 dark:to-sky-950">
                <div className="h-9 w-9 rounded-lg bg-white shadow-sm" />
                <span className="absolute right-4 top-4 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-medium text-zinc-600 backdrop-blur">
                  {formatCreatedOn(campaign.created_at)}
                </span>
                {campaign.status === "active" && (
                  <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-emerald-700 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                )}
                {campaign.status === "draft" && (
                  <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-zinc-600 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    Draft
                  </span>
                )}
                {campaign.status === "completed" && (
                  <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-blue-700 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    Completed
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {campaign.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                  {campaign.objective}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {creators}
                    </p>
                    <p className="text-xs text-zinc-500">Creators</p>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {published}
                    </p>
                    <p className="text-xs text-zinc-500">Published</p>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      €{committedBudget}
                    </p>
                    <p className="text-xs text-zinc-500">Committed budget</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-3 text-sm">
                  <Link
                    href={`/brand/campaigns/${campaign.id}`}
                    className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    Open campaign →
                  </Link>
                  <span className="text-zinc-300 dark:text-zinc-700">/</span>
                  <Link
                    href={`/brand/campaigns/${campaign.id}`}
                    className="flex items-center gap-1 text-zinc-500 hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    My brief
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        <div className="overflow-hidden rounded-2xl border-2 border-dashed border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="h-28 bg-gradient-to-br from-zinc-50 to-blue-50 dark:from-zinc-900 dark:to-blue-950" />
          <div className="p-5">
            <h3 className="font-semibold text-blue-600">Create a campaign</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Launch a new campaign in 2 minutes — with AI, the Naano team, or
              an existing link.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <div>
                <p className="font-semibold text-zinc-300 dark:text-zinc-700">
                  —
                </p>
                <p className="text-xs text-zinc-400">Creators</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-300 dark:text-zinc-700">
                  —
                </p>
                <p className="text-xs text-zinc-400">Published</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-300 dark:text-zinc-700">
                  —
                </p>
                <p className="text-xs text-zinc-400">Committed budget</p>
              </div>
            </div>
            <Link
              href="/brand/campaigns/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get started →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
