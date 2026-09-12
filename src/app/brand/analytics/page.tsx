import Link from "next/link";
import { Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ResultsTabs } from "@/components/dashboard/results/ResultsTabs";
import { CampaignFilterSelect } from "@/components/dashboard/results/CampaignFilterSelect";
import { PerformanceChart } from "@/components/dashboard/results/PerformanceChart";
import { analyticsWindow, bucketClicksByDay } from "@/lib/analytics-window";

type BookingRow = {
  id: string;
  status: string;
  price_agreed: number;
  creator: { id: string; name: string; median_views: number | null } | null;
};

export default async function AnalyticsPage({
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

  let bookingsQuery = supabase
    .from("bookings")
    .select("id, status, price_agreed, creator:creators(id, name, median_views)");
  if (campaign) bookingsQuery = bookingsQuery.eq("campaign_id", campaign);
  const { data: bookingsData } = await bookingsQuery;
  const bookings = (bookingsData ?? []) as unknown as BookingRow[];

  const bookingIds = bookings.map((b) => b.id);
  const { data: clicks } = bookingIds.length
    ? await supabase
        .from("click_events")
        .select("booking_id, clicked_at")
        .in("booking_id", bookingIds)
    : { data: [] as { booking_id: string; clicked_at: string }[] };

  const publishedBookings = bookings.filter(
    (b) => b.status === "live" || b.status === "completed"
  );
  const budgetCommitted = bookings.reduce(
    (sum, b) => sum + Number(b.price_agreed),
    0
  );
  const reservations = bookings.length;

  const { since, buckets } = analyticsWindow(30);
  const qualifiedClicksLast30 = (clicks ?? []).filter(
    (c) => new Date(c.clicked_at).getTime() >= since
  ).length;

  const totalMedianViews = publishedBookings.reduce(
    (sum, b) => sum + (b.creator?.median_views ?? 0),
    0
  );
  const estimatedLow = Math.round(totalMedianViews * 0.8);
  const estimatedHigh = Math.round(totalMedianViews * 1.2);

  const series = bucketClicksByDay(clicks ?? [], buckets);

  const attributionMap = new Map<
    string,
    { name: string; posts: number; clicks: number }
  >();
  for (const b of bookings) {
    if (!b.creator) continue;
    const entry = attributionMap.get(b.creator.id) ?? {
      name: b.creator.name,
      posts: 0,
      clicks: 0,
    };
    if (b.status === "live" || b.status === "completed") entry.posts += 1;
    attributionMap.set(b.creator.id, entry);
  }
  for (const c of clicks ?? []) {
    const booking = bookings.find((b) => b.id === c.booking_id);
    if (!booking?.creator) continue;
    const entry = attributionMap.get(booking.creator.id);
    if (entry) entry.clicks += 1;
  }
  const attribution = Array.from(attributionMap.values());

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Results
      </h1>
      <ResultsTabs active="analytics" />

      <div className="mt-4">
        <CampaignFilterSelect
          campaigns={campaigns ?? []}
          current={campaign ?? "all"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-zinc-500">
            Estimated range
            <Info className="h-3.5 w-3.5" />
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            {totalMedianViews > 0 ? `${estimatedLow}–${estimatedHigh}` : 0}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {publishedBookings.length > 0
              ? "Based on published posts"
              : "No posts published yet"}
          </p>
        </div>
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-zinc-500">
            Qualified clicks
            <Info className="h-3.5 w-3.5" />
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            {qualifiedClicksLast30}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Last 30 days</p>
        </div>
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-sm text-zinc-500">
            Budget committed
            <Info className="h-3.5 w-3.5" />
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            €{budgetCommitted}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Reservations {reservations}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Performance over time
            </h2>
            <span className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              Month
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Qualified clicks
            </span>
            <span>Click on a map or legend to zoom in.</span>
          </div>
          <div className="mt-4">
            <PerformanceChart series={series} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Post performance
            </h2>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900">
              Pixelless
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Latest statistics collected on your posts.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Posts
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {publishedBookings.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                reactions
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                0
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                comments
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                0
              </span>
            </div>
          </div>
          <Link
            href="/brand/analytics/posts"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View posts →
          </Link>
        </div>
      </div>

      {/* Decorative — no real pixel/conversion tracking implemented */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Measure conversions on your site
            </p>
            <p className="text-sm text-zinc-500">
              Connect the pixel to add visits, sign-ups, and revenue to your
              post results.
            </p>
          </div>
        </div>
        <span className="text-sm font-medium text-blue-600">
          Install the pixel
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Attribution by creator
          </h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500 dark:border-zinc-800">
              <th className="px-5 py-3">Creator</th>
              <th className="px-5 py-3">Posts</th>
              <th className="px-5 py-3">Qualified clicks</th>
            </tr>
          </thead>
          <tbody>
            {attribution.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-zinc-500">
                  No attribution data yet.
                </td>
              </tr>
            ) : (
              attribution.map((a) => (
                <tr
                  key={a.name}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {a.name}
                  </td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                    {a.posts}
                  </td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                    {a.clicks}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
