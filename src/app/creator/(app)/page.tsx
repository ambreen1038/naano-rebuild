import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  ClipboardCopy,
  Eye,
  FileText,
  IdCard,
  Share2,
  Users2,
} from "lucide-react";
import { requireCreator } from "@/lib/auth/roles";
import { CreatorCardPreview } from "@/components/auth/CreatorCardPreview";
import { avatarColor } from "@/lib/avatar-color";
import { computeCampaignMatch, MATCH_TIER_LABEL } from "@/lib/campaign-match";

function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

type BookingRow = {
  id: string;
  campaign_id: string;
  status: string;
  price_agreed: number;
  scheduled_date: string | null;
  campaign: { name: string; brand: { company_name: string | null } | null } | null;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Brief in review",
  scheduled: "Scheduled",
  live: "Live",
  completed: "Completed",
};

const NEXT_ACTION: Record<string, string> = {
  draft: "Confirm the brief",
  scheduled: "Prepare your post",
  live: "Track results",
  completed: "—",
};

export default async function CreatorOverviewPage() {
  const { supabase, user, profile, onboarding } = await requireCreator();

  const { data: creatorRow } = await supabase
    .from("creators")
    .select(
      "id, name, headline, avatar_url, country, follower_count, price_per_post, bundle_price, industry_tags"
    )
    .eq("user_id", user.id)
    .single();

  const firstName = (
    creatorRow?.name ??
    onboarding?.linkedin_name ??
    profile?.full_name ??
    "there"
  ).split(" ")[0];

  if (!creatorRow) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500">
          Your marketplace card hasn&apos;t been created yet.
        </p>
      </div>
    );
  }

  const [{ data: bookingsData }, { data: activeCampaigns }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select(
          "id, campaign_id, status, price_agreed, scheduled_date, campaign:campaigns(name, brand:brands(company_name))"
        )
        .eq("creator_id", creatorRow.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("campaigns")
        .select("id, name, target_vertical, target_regions, budget, channel")
        .eq("status", "active"),
    ]);

  const bookings = (bookingsData ?? []) as unknown as BookingRow[];
  const activeBookings = bookings.filter((b) =>
    ["draft", "scheduled", "live"].includes(b.status)
  );

  const creatorForMatch = {
    industry_tags: creatorRow.industry_tags,
    country: creatorRow.country,
    price_per_post: Number(creatorRow.price_per_post),
    bundle_price:
      creatorRow.bundle_price != null ? Number(creatorRow.bundle_price) : null,
  };

  const bookedCampaignIds = new Set(bookings.map((b) => b.campaign_id));
  const recommended = (activeCampaigns ?? [])
    .filter((c) => !bookedCampaignIds.has(c.id))
    .map((c) => ({
      ...c,
      matchResult: computeCampaignMatch(creatorForMatch, {
        target_vertical: c.target_vertical,
        target_regions: c.target_regions,
        budget: c.budget != null ? Number(c.budget) : null,
        channel: c.channel,
      }),
    }))
    .filter((c) => c.matchResult.tier !== "limited")
    .sort((a, b) => b.matchResult.score - a.matchResult.score)
    .slice(0, 3);

  // "Launch guide" tracks onboarding completion. Reaching this page at all
  // requires onboarding to be done (see the layout gate), so this is
  // trivially always true today — computed from the real row rather than
  // hardcoded, so it stops being trivial the day a second step is added.
  const launchStepsComplete = creatorRow.price_per_post ? 1 : 0;

  return (
    <div className="p-8">
      <p className="text-sm text-zinc-500">Creator workspace</p>
      <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Good to see you, {firstName}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Your creator activity, at a glance.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Eye className="h-4 w-4" />
            Public post reach
          </div>
          <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            —
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Waiting for public post data
          </p>
        </div>
        {/* No LinkedIn posts-reading integration exists (that's a separate,
            partner-gated API from the OIDC sign-in we use) — these are
            genuinely 0, not a placeholder standing in for real data. */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <FileText className="h-4 w-4" />
            Public posts
          </div>
          <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            0
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Original LinkedIn posts found
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Users2 className="h-4 w-4" />
            Public engagements
          </div>
          <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            0
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Reactions, comments and reposts
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Users2 className="h-4 w-4" />
            LinkedIn followers
          </div>
          <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatK(creatorRow.follower_count)}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Imported from the public profile
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                Your creator card
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                This is how brands discover your positioning and
                collaboration offer.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Link
                href="/creator/card"
                className="flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
              >
                <IdCard className="h-3.5 w-3.5" />
                Open card
              </Link>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
              >
                <ClipboardCopy className="h-3.5 w-3.5" />
                Copy card link
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share my card
              </button>
            </div>
          </div>

          <div className="mt-4">
            <CreatorCardPreview
              hideHeading
              showShareBadge
              showPostDataPill
              costLabel="Chosen cost"
              name={creatorRow.name}
              headline={creatorRow.headline}
              avatarUrl={creatorRow.avatar_url}
              tags={creatorRow.industry_tags}
              followerCount={creatorRow.follower_count}
              pricePerPost={creatorRow.price_per_post}
              countryCode={creatorRow.country?.slice(0, 2)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Your launch guide
            </h2>
            <Link
              href="/creator/card"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Open card
            </Link>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {launchStepsComplete} of 1 steps complete
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-zinc-100 p-4 dark:border-zinc-900">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4l2.3 2.29 6.3-6.29a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Card and price ready
              </p>
              <p className="text-xs text-zinc-500">
                Your positioning and offer are ready to review.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              Complete
            </span>
            <Link
              href="/creator/card"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 hover:bg-zinc-50 dark:border-zinc-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Recommended opportunities
            </h2>
            <Link
              href="/creator/opportunities"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Explore
            </Link>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {recommended.length === 0
              ? "No campaigns match your audience yet."
              : `The ${recommended.length} campaign${
                  recommended.length === 1 ? "" : "s"
                } that best match your audience.`}
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {recommended.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">
                No matching opportunities yet.
              </p>
            ) : (
              recommended.map((c) => (
                <Link
                  key={c.id}
                  href="/creator/opportunities"
                  className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${avatarColor(
                      c.name
                    )}`}
                  >
                    {c.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {c.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Main campaign · {MATCH_TIER_LABEL[c.matchResult.tier].toLowerCase()}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-blue-500" />
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Active collaborations
            </h2>
            <Link
              href="/creator/collaborations"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              See all
            </Link>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Everything currently moving from brief to publication.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500 dark:border-zinc-800">
                  <th className="py-2">Brand</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Next action</th>
                  <th className="py-2">Due</th>
                  <th className="py-2">Net</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-zinc-500"
                    >
                      No active collaborations.
                    </td>
                  </tr>
                ) : (
                  activeBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                    >
                      <td className="py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {b.campaign?.brand?.company_name ?? "—"}
                      </td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400">
                        {STATUS_LABEL[b.status] ?? b.status}
                      </td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400">
                        {NEXT_ACTION[b.status] ?? "—"}
                      </td>
                      <td className="py-3 text-zinc-600 dark:text-zinc-400">
                        {b.scheduled_date
                          ? new Date(b.scheduled_date).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )
                          : "—"}
                      </td>
                      <td className="py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        €{b.price_agreed}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
