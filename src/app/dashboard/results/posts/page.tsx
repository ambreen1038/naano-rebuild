import { Download, LayoutGrid, Rows3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ResultsTabs } from "@/components/dashboard/results/ResultsTabs";
import { CampaignFilterSelect } from "@/components/dashboard/results/CampaignFilterSelect";

type PostRow = {
  id: string;
  status: string;
  published_at: string | null;
  post_url: string | null;
  creator: { name: string; median_views: number | null } | null;
  campaign: { name: string } | null;
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { campaign } = await searchParams;
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name")
    .order("created_at", { ascending: false });

  let query = supabase
    .from("bookings")
    .select(
      "id, status, published_at, post_url, creator:creators(name, median_views), campaign:campaigns(name)"
    )
    .in("status", ["live", "completed"])
    .order("published_at", { ascending: false });
  if (campaign) query = query.eq("campaign_id", campaign);

  const { data } = await query;
  const posts = (data ?? []) as unknown as PostRow[];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Results
      </h1>
      <ResultsTabs active="posts" />

      <div className="mt-4">
        <CampaignFilterSelect
          campaigns={campaigns ?? []}
          current={campaign ?? "all"}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-5 dark:border-zinc-800">
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Published content
            </h2>
            <p className="text-sm text-zinc-500">{posts.length} Posts</p>
          </div>
          {/* View toggle and export are decorative — table is the only real view */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50">
                <Rows3 className="h-3.5 w-3.5" />
                Painting
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-500">
                <LayoutGrid className="h-3.5 w-3.5" />
                Flow
              </span>
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-zinc-200 px-5 dark:border-zinc-800">
          <span className="border-b-2 border-blue-600 py-3 text-sm font-medium text-blue-600">
            All articles
          </span>
          <span className="py-3 text-sm font-medium text-zinc-400">
            LinkedIn
          </span>
          <span className="py-3 text-sm font-medium text-zinc-400">
            X (Twitter)
          </span>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500 dark:border-zinc-800">
              <th className="px-5 py-3">Post</th>
              <th className="px-5 py-3">Campaign</th>
              <th className="px-5 py-3">Published on</th>
              <th className="px-5 py-3">Estimated range</th>
              <th className="px-5 py-3">Reactions</th>
              <th className="px-5 py-3">Comments</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-zinc-500">
                  No articles have been published yet.
                </td>
              </tr>
            ) : (
              posts.map((p) => {
                const views = p.creator?.median_views ?? 0;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                  >
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {p.post_url ? (
                        <a
                          href={p.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {p.creator?.name ?? "Post"}
                        </a>
                      ) : (
                        p.creator?.name ?? "—"
                      )}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                      {p.campaign?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                      {p.published_at
                        ? new Date(p.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                      {views > 0
                        ? `${Math.round(views * 0.8)}–${Math.round(views * 1.2)}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">0</td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">0</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-5 py-3 text-sm text-zinc-500 dark:border-zinc-800">
          <span>{posts.length} Posts</span>
          <label className="flex items-center gap-2">
            Number of lines per page:
            <select className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <option>25</option>
              <option>10</option>
              <option>50</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
