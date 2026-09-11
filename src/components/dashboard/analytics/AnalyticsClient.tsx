"use client";

import { useState } from "react";
import {
  Activity,
  ChevronDown,
  Eye,
  FileText,
  ShieldCheck,
  Users2,
} from "lucide-react";

export type DateRange = "all" | "30d" | "90d" | "12mo";

const RANGE_LABEL: Record<DateRange, string> = {
  all: "All time",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12mo": "Last 12 months",
};

function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between">
        <p className="text-sm text-zinc-500">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  filled,
}: {
  label: string;
  value: string;
  filled: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500">{label}</span>
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div
          className="h-1 rounded-full bg-blue-600"
          style={{ width: filled ? "100%" : "0%" }}
        />
      </div>
    </div>
  );
}

/**
 * Every number here is real: `followerCount` is what the creator entered at
 * onboarding (LinkedIn's OIDC sign-in doesn't expose follower count outside
 * its gated Marketing Developer Platform, so this is self-reported, not
 * scraped or invented). Posts/reach/engagements are genuinely 0 — there is
 * no LinkedIn API available to this app, official or otherwise, that returns
 * a member's public post history, so no such data has ever existed to
 * import. This screen intentionally never claims a background job is
 * running, since none is or will be without a real, authorized data source.
 */
export function AnalyticsClient({
  followerCount,
  medianViews,
}: {
  followerCount: number;
  medianViews: number | null;
}) {
  const [range, setRange] = useState<DateRange>("all");

  const publicPosts = 0;
  const publicEngagements = 0;
  const reachDataPercentage = 0; // 0 posts imported -> 0% have reach data.
  const postReachLabel =
    medianViews != null ? formatK(medianViews) : "Not available";

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            What&apos;s available from your public LinkedIn profile today.
          </p>
        </div>
        <div className="relative">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DateRange)}
            className="appearance-none rounded-lg border border-zinc-300 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-zinc-700 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            {(Object.keys(RANGE_LABEL) as DateRange[]).map((r) => (
              <option key={r} value={r}>
                {RANGE_LABEL[r]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-sky-50 via-white to-sky-100 p-6 dark:border-zinc-800 dark:from-sky-950 dark:via-zinc-950 dark:to-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-md">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Public LinkedIn snapshot
            </span>
            <h2 className="mt-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Public post data isn&apos;t available yet
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              LinkedIn&apos;s official API doesn&apos;t provide public post
              history or engagement outside its gated Partner Program — only
              the follower count you entered at signup is shown below.
            </p>
          </div>
          <div className="shrink-0 border-l border-zinc-200 pl-6 text-right dark:border-zinc-800">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {reachDataPercentage}%
            </p>
            <p className="text-xs text-zinc-500">
              of imported posts include reach data
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
              No public post found yet
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Public posts"
          value={String(publicPosts)}
          hint="Original LinkedIn posts found"
        />
        <StatCard
          icon={Eye}
          label="Public post reach"
          value={postReachLabel}
          hint="No official LinkedIn API provides this"
        />
        <StatCard
          icon={Activity}
          label="Public engagements"
          value={String(publicEngagements)}
          hint="Reactions, comments and reposts"
        />
        <StatCard
          icon={Users2}
          label="LinkedIn followers"
          value={formatK(followerCount)}
          hint="Entered on your profile"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Recent LinkedIn posts
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Open the original post on LinkedIn.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">
              No public posts available
            </p>
            <p className="mt-1 max-w-xs text-sm text-zinc-500">
              LinkedIn doesn&apos;t offer a public post-history API to Naano,
              so this can&apos;t populate today.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Public profile summary
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            From your profile — LinkedIn&apos;s public API doesn&apos;t
            expose these directly.
          </p>
          <div className="mt-5 flex flex-col gap-4">
            <SummaryRow
              label="LinkedIn followers"
              value={followerCount.toLocaleString()}
              filled={followerCount > 0}
            />
            <SummaryRow
              label="Public posts"
              value={String(publicPosts)}
              filled={false}
            />
            <SummaryRow
              label="Posts with reach data"
              value="0"
              filled={false}
            />
            <SummaryRow
              label="Public engagements"
              value={String(publicEngagements)}
              filled={false}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            No public-posts integration exists yet
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">
            LinkedIn doesn&apos;t offer an API for reading another
            member&apos;s public post history. Only OAuth sign-in (name,
            photo, email) and the follower count you self-reported are
            available today.
          </p>
        </div>
      </div>
    </div>
  );
}
