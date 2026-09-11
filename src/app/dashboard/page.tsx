import Link from "next/link";
import {
  ChevronRight,
  Eye,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Users,
  Mic,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { avatarColor } from "@/lib/avatar-color";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}

function TodoRow({
  title,
  badge,
  badgeClass,
  href,
}: {
  title: string;
  badge: string;
  badgeClass: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-900">
      <span className="h-5 w-5 shrink-0 rounded-full border-2 border-zinc-300 dark:border-zinc-700" />
      <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {title}
      </span>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}
      >
        {badge}
      </span>
      {href ? (
        <Link
          href={href}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 dark:border-zinc-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

type CreatorCardData = {
  id: string;
  name: string;
  headline: string;
  vertical: string;
  price_per_post: number;
  fit: number;
};

function CreatorCard({ creator }: { creator: CreatorCardData }) {
  const initial = creator.name.charAt(0).toUpperCase();
  return (
    <div className="w-56 shrink-0 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="h-14 rounded-t-2xl bg-gradient-to-br from-blue-200 to-emerald-200 dark:from-blue-950 dark:to-emerald-950" />
      <div className="flex flex-col items-center px-4 pb-4">
        <div
          className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white text-lg font-semibold text-white dark:border-zinc-950 ${avatarColor(
            creator.name
          )}`}
        >
          {initial}
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {creator.name}
        </p>
        <p className="text-center text-xs text-zinc-500">
          {creator.headline}
        </p>
        <span className="mt-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          {creator.fit}% ICP
        </span>
        <p className="mt-2 text-sm text-zinc-500">
          from{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            {creator.price_per_post}€
          </span>{" "}
          /post
        </p>
        <Link
          href="/dashboard/creators"
          className="mt-3 w-full rounded-full border border-zinc-200 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-zinc-800 dark:hover:bg-blue-950"
        >
          Add
        </Link>
      </div>
    </div>
  );
}

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_name, industry")
    .eq("id", user!.id)
    .single();

  const firstName = (profile?.full_name || user?.email || "there").split(
    " "
  )[0];
  const companyName = profile?.company_name ?? "your company";
  const industry = profile?.industry ?? "other";

  const [{ data: activeBookings }, { count: postsPublished }, { data: creators }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("creator_id")
        .in("status", ["scheduled", "live", "completed"]),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .in("status", ["live", "completed"]),
      supabase
        .from("creators")
        .select("id, name, headline, vertical, price_per_post, follower_count")
        .order("follower_count", { ascending: false }),
    ]);

  const creatorsActivated = new Set(
    (activeBookings ?? []).map((b) => b.creator_id)
  ).size;

  const rankedCreators: CreatorCardData[] = (creators ?? [])
    .map((c) => ({
      id: c.id,
      name: c.name,
      headline: c.headline,
      vertical: c.vertical,
      price_per_post: Number(c.price_per_post),
      fit: c.vertical === industry ? 90 : 60,
    }))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 8);

  return (
    <div className="relative p-8 pb-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Hello {firstName} 👋</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Here is what is happening for {companyName} on Naano.
          </h1>
        </div>
        <Link
          href="/dashboard/campaigns"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New campaign
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Creators activated" value={creatorsActivated} />
        <StatCard icon={FileText} label="Posts published" value={postsPublished ?? 0} />
        <StatCard icon={MessageSquare} label="Profiles engaged" value={0} />
        <StatCard icon={Eye} label="Impressions" value={0} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                To do
              </h2>
              <p className="text-sm text-zinc-500">Priority actions</p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              See all
            </button>
          </div>
          <div className="mt-2">
            <TodoRow
              title="Top up your wallet"
              badge="Blocked"
              badgeClass="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              href="/dashboard/billing"
            />
            <TodoRow
              title="Book a call for your next campaign"
              badge="Suggested"
              badgeClass="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
            />
            <TodoRow
              title="Find new creators for your next campaign"
              badge="Suggested"
              badgeClass="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
              href="/dashboard/creators"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="bg-gradient-to-br from-blue-100 to-sky-50 p-5 dark:from-blue-950 dark:to-zinc-950">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
              Recently engaged companies
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                ICP accounts in your target
              </h2>
              <button
                type="button"
                className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-600"
              >
                See all
              </button>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-zinc-500">No company has engaged yet.</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-1 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Messages
          </h2>
          <p className="text-sm text-zinc-500">Waiting on your reply</p>
          <p className="mt-4 text-sm text-zinc-500">No conversation yet.</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-3 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                New creators
              </h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                {rankedCreators.length}
              </span>
            </div>
            <Link
              href="/dashboard/creators"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Explore
            </Link>
          </div>
          <p className="text-sm text-zinc-500">Profiles that fit your buyers</p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {rankedCreators.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative — booking a call routes to Naano's Managed Campaigns
          offering, which is out of scope for this rebuild. */}
      <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
          N
        </div>
        <div className="flex-1">
          <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Naano experts available
          </span>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Need an expert eye? Book a free call.
          </h3>
          <p className="text-sm text-zinc-500">
            15 minutes with a Naano expert to frame your next campaign or
            improve the posts already running.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Book a free call →
          </button>
          <p className="text-xs text-zinc-400">
            No commitment · Slot available today
          </p>
        </div>
      </div>

      {/* Decorative — not wired to a real assistant. Sticky (not fixed) so
          it stays correctly centered as the sidebar reflows the content
          column, with no hardcoded offset to keep in sync. */}
      <div className="pointer-events-none sticky bottom-6 z-20 mt-6 flex justify-center">
        <div className="pointer-events-auto flex w-full max-w-lg items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <span className="flex-1 text-sm text-zinc-400">
            What can I help you find?
          </span>
          <Sparkles className="hidden h-4 w-4 shrink-0 text-zinc-300 sm:block" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900">
            <Mic className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
