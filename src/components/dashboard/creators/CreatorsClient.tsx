"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  Building2,
  Check,
  Cloud,
  Globe,
  ListOrdered,
  Loader2,
  Search,
  Shuffle,
  Sparkles,
  Square,
  Star,
  User,
  Users,
} from "lucide-react";
import { avatarColor } from "@/lib/avatar-color";
import { COUNTRIES } from "@/lib/countries";
import { INDUSTRY_TAGS } from "@/lib/industries";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";
import { CheckboxListFilter } from "./CheckboxListFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import {
  EMPTY_PERFORMANCE_FILTERS,
  PerformanceFiltersPanel,
  type PerformanceFilters,
} from "./PerformanceFiltersPanel";
import { GroupSelectionModal } from "./GroupSelectionModal";
import { BookingModal } from "./BookingModal";
import { NegotiationModal } from "./NegotiationModal";
import { ViewProfileModal } from "./ViewProfileModal";
import type { CampaignOption } from "./invite-shared";
import { matchCreatorsWithAI } from "@/app/brand/creators/ai-match-actions";

export type Creator = {
  id: string;
  name: string;
  headline: string;
  vertical: string;
  industry_tags: string[];
  country: string | null;
  follower_count: number;
  price_per_post: number;
  median_views: number | null;
  cpm: number | null;
  engagement_rate: number | null;
  last_posted_at: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  bundle_price: number | null;
};

const SUGGESTIONS = [
  "Find creators who already reach Data Analyst",
  "Find creators with credible content about Churn prediction and customer retention modeling for SaaS platforms",
  "Build a shortlist for this campaign angle: 'From Data Analyst to ML Engineer in Minutes'—position SmartML as the tool",
];

function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

type InviteModalState =
  | { view: "group" }
  | { view: "profile"; creator: Creator }
  | { view: "book"; creator: Creator }
  | { view: "negotiate"; creator: Creator }
  | null;

/** Shared by both the Marketplace grid and AI Matching results — a
 * creator's selected/saved state and every action (book, save, view
 * profile) live in one place at the CreatorsClient level, so switching
 * between the two modes never loses selection state or opens a second,
 * disconnected copy of a creator's data. */
type CreatorActions = {
  selectedIds: Set<string>;
  savedIds: Set<string>;
  toggleSelected: (id: string) => void;
  toggleSaved: (id: string) => void;
  openModal: (state: InviteModalState) => void;
};

function CreatorCard({
  creator,
  selected,
  onToggleSelect,
  saved,
  onToggleSave,
  onBook,
  onViewProfile,
}: {
  creator: Creator;
  selected: boolean;
  onToggleSelect: () => void;
  saved: boolean;
  onToggleSave: () => void;
  onBook: () => void;
  onViewProfile: () => void;
}) {
  const initial = creator.name.charAt(0).toUpperCase();
  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white dark:bg-zinc-950 ${
        selected
          ? "border-blue-400 ring-2 ring-blue-100 dark:border-blue-600 dark:ring-blue-950"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="relative h-24 bg-gradient-to-b from-sky-100 to-sky-50 p-3 dark:from-sky-950 dark:to-zinc-950">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSelect}
              aria-pressed={selected}
              aria-label={selected ? "Unselect creator" : "Select creator"}
              className={`flex h-7 w-7 items-center justify-center rounded-md border ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300"
              }`}
            >
              {selected ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
            </button>
            {creator.linkedin_url ? (
              <a
                href={creator.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${creator.name}'s LinkedIn profile`}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            ) : (
              <span
                title="No LinkedIn URL on file for this creator"
                aria-label="No LinkedIn URL on file"
                className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-md bg-zinc-100 text-zinc-300 dark:bg-zinc-900 dark:text-zinc-700"
              >
                <LinkedinIcon className="h-4 w-4" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              aria-label={saved ? "Unsave creator" : "Save creator"}
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                saved
                  ? "bg-amber-400 text-white"
                  : "bg-white text-zinc-400 hover:text-amber-500"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onBook}
              className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              To book
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center px-4 pb-2">
        <div
          className={`relative z-10 -mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white text-xl font-semibold text-white dark:border-zinc-950 ${avatarColor(
            creator.name
          )}`}
        >
          {initial}
        </div>
        <p className="mt-2 font-semibold text-zinc-900 dark:text-zinc-50">
          {creator.name}
        </p>
        <p className="text-xs">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {creator.industry_tags.slice(0, 2).join(" · ")}
          </span>
          {creator.country && (
            <span className="text-zinc-400"> {creator.country}</span>
          )}
        </p>

        <div className="mt-4 grid w-full grid-cols-4 divide-x divide-zinc-100 border-y border-zinc-100 py-3 dark:divide-zinc-800 dark:border-zinc-800">
          {[
            { value: formatK(creator.follower_count), label: "FOLLOWERS" },
            {
              value:
                creator.median_views != null
                  ? formatK(creator.median_views)
                  : "—",
              label: "MEDIAN VIEWS",
            },
            {
              value: creator.cpm != null ? `€${creator.cpm}` : "—",
              label: "CPM",
            },
            { value: `€${creator.price_per_post}`, label: "COST / POST" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {s.value}
              </p>
              <p className="text-[9px] font-medium leading-tight text-zinc-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onViewProfile}
          className="flex w-full items-center gap-2 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <User className="h-3.5 w-3.5" />
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            View profile
          </span>
          <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}

function MarketplaceView({
  creators,
  primaryIndustry,
  actions,
}: {
  creators: Creator[];
  primaryIndustry: string;
  actions: CreatorActions;
}) {
  const { selectedIds, savedIds, toggleSelected, toggleSaved, openModal } = actions;
  const [subTab, setSubTab] = useState<"all" | "shortlist">("all");
  const [search, setSearch] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sort, setSort] = useState<
    "best_match" | "followers" | "price_asc" | "price_desc"
  >("best_match");
  const [perf, setPerf] = useState<PerformanceFilters>(
    EMPTY_PERFORMANCE_FILTERS
  );

  const priceBounds = useMemo(() => {
    const prices = creators.map((c) => c.price_per_post);
    return {
      min: Math.floor(Math.min(...prices, 0)),
      max: Math.ceil(Math.max(...prices, 100)),
    };
  }, [creators]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    priceBounds.min,
    priceBounds.max,
  ]);

  const filtered = useMemo(() => {
    let list = creators.filter((c) => {
      if (
        search &&
        !`${c.name} ${c.headline}`.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (
        selectedIndustries.length &&
        !c.industry_tags.some((t) => selectedIndustries.includes(t))
      )
        return false;
      if (
        selectedCountries.length &&
        !(c.country && selectedCountries.includes(c.country))
      )
        return false;
      if (
        c.price_per_post < priceRange[0] ||
        c.price_per_post > priceRange[1]
      )
        return false;
      if (
        perf.maxCpm &&
        c.cpm != null &&
        c.cpm > Number(perf.maxCpm)
      )
        return false;
      if (
        perf.minMedianViews &&
        c.median_views != null &&
        c.median_views < Number(perf.minMedianViews)
      )
        return false;
      if (perf.minFollowers && c.follower_count < Number(perf.minFollowers))
        return false;
      if (perf.maxFollowers && c.follower_count > Number(perf.maxFollowers))
        return false;
      if (
        perf.minEngagement &&
        c.engagement_rate != null &&
        c.engagement_rate < Number(perf.minEngagement)
      )
        return false;
      if (perf.postedRecently !== "any" && c.last_posted_at) {
        const days =
          (Date.now() - new Date(c.last_posted_at).getTime()) / 86400000;
        if (days > Number(perf.postedRecently)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "followers") return b.follower_count - a.follower_count;
      if (sort === "price_asc") return a.price_per_post - b.price_per_post;
      if (sort === "price_desc") return b.price_per_post - a.price_per_post;
      // best_match: primary industry match first, then followers
      const aFit = a.industry_tags.includes(primaryIndustry) ? 1 : 0;
      const bFit = b.industry_tags.includes(primaryIndustry) ? 1 : 0;
      if (aFit !== bFit) return bFit - aFit;
      return b.follower_count - a.follower_count;
    });

    return list;
  }, [
    creators,
    search,
    selectedIndustries,
    selectedCountries,
    priceRange,
    perf,
    sort,
    primaryIndustry,
  ]);

  return (
    <div>
      <div className="mt-6 flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setSubTab("all")}
          className={`flex items-center gap-2 pb-3 text-sm font-semibold ${
            subTab === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-zinc-500"
          }`}
        >
          All creators
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs dark:bg-blue-950">
            {creators.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab("shortlist")}
          className={`flex items-center gap-2 pb-3 text-sm font-medium ${
            subTab === "shortlist"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-zinc-500"
          }`}
        >
          Shortlist
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-900">
            {savedIds.size}
          </span>
        </button>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
        <ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Ranked for your company
          </p>
          <p className="text-sm text-zinc-500">
            All creators are shown from most to least relevant, using sector
            fit first and verified performance statistics to refine the
            order.
          </p>
        </div>
      </div>

      {subTab === "all" ? (
        <>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a creator..."
                className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
              />
            </div>
            <label className="flex shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-left leading-tight">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Sort by
                </span>
                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value as typeof sort)
                  }
                  className="block bg-transparent font-medium text-zinc-900 outline-none dark:text-zinc-50"
                >
                  <option value="best_match">Best match</option>
                  <option value="followers">Most followers</option>
                  <option value="price_asc">Lowest price</option>
                  <option value="price_desc">Highest price</option>
                </select>
              </span>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <CheckboxListFilter
                label="Industry"
                icon={<Building2 className="h-4 w-4" />}
                items={INDUSTRY_TAGS}
                selected={selectedIndustries}
                onChange={setSelectedIndustries}
                searchPlaceholder="Search an industry…"
              />
              <CheckboxListFilter
                label="Country"
                icon={<Globe className="h-4 w-4" />}
                items={COUNTRIES}
                selected={selectedCountries}
                onChange={setSelectedCountries}
                searchPlaceholder="Search a country..."
              />
              <PriceRangeFilter
                allPrices={creators.map((c) => c.price_per_post)}
                min={priceBounds.min}
                max={priceBounds.max}
                value={priceRange}
                onChange={setPriceRange}
              />
              <PerformanceFiltersPanel value={perf} onApply={setPerf} />
            </div>
            <span className="text-sm text-zinc-500">
              {filtered.length} creators
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Top ranked creators
            </h2>
            <p className="text-xs text-zinc-500">
              The strongest profiles according to your sector and performance
              signals.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CreatorCard
                key={c.id}
                creator={c}
                selected={selectedIds.has(c.id)}
                onToggleSelect={() => toggleSelected(c.id)}
                saved={savedIds.has(c.id)}
                onToggleSave={() => toggleSaved(c.id)}
                onBook={() => openModal({ view: "book", creator: c })}
                onViewProfile={() => openModal({ view: "profile", creator: c })}
              />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-12 text-center text-sm text-zinc-500">
                No creators match these filters.
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {savedIds.size === 0 ? (
            <p className="mt-8 text-center text-sm text-zinc-500">
              Star a creator to add them to your shortlist.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered
                .filter((c) => savedIds.has(c.id))
                .map((c) => (
                  <CreatorCard
                    key={c.id}
                    creator={c}
                    selected={selectedIds.has(c.id)}
                    onToggleSelect={() => toggleSelected(c.id)}
                    saved={savedIds.has(c.id)}
                    onToggleSave={() => toggleSaved(c.id)}
                    onBook={() => openModal({ view: "book", creator: c })}
                    onViewProfile={() =>
                      openModal({ view: "profile", creator: c })
                    }
                  />
                ))}
              {filtered.filter((c) => savedIds.has(c.id)).length === 0 && (
                <p className="col-span-full py-12 text-center text-sm text-zinc-500">
                  No shortlisted creators match your current search/filters.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SelectionBar({
  creators,
  selectedIds,
  onCancel,
  onInvite,
}: {
  creators: Creator[];
  selectedIds: Set<string>;
  onCancel: () => void;
  onInvite: () => void;
}) {
  const first = creators.find((c) => selectedIds.has(c.id));
  if (!first) return null;
  const initial = first.name.charAt(0).toUpperCase();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-2xl bg-zinc-900 px-5 py-3.5 text-white shadow-xl dark:bg-zinc-800">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColor(
            first.name
          )}`}
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {selectedIds.size} creator{selectedIds.size === 1 ? "" : "s"}{" "}
            selected
          </p>
          <p className="truncate text-xs text-zinc-300">
            Invite them to one campaign in a single action.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onInvite}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Invite selection
        </button>
      </div>
    </div>
  );
}

type MatchedRow = { creator: Creator; reason: string };

function MatchedCreatorRow({
  rank,
  creator,
  reason,
  selected,
  onToggleSelect,
  saved,
  onToggleSave,
  onBook,
  onViewProfile,
}: {
  rank: number;
  creator: Creator;
  reason: string;
  selected: boolean;
  onToggleSelect: () => void;
  saved: boolean;
  onToggleSave: () => void;
  onBook: () => void;
  onViewProfile: () => void;
}) {
  const initial = creator.name.charAt(0).toUpperCase();
  return (
    <div
      className={`flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 last:border-0 dark:border-zinc-900 sm:flex-row sm:items-center ${
        selected ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
    >
      <span className="w-6 shrink-0 text-xs font-medium text-zinc-400">
        {String(rank).padStart(2, "0")}
      </span>
      <button
        type="button"
        onClick={onToggleSelect}
        aria-pressed={selected}
        className={`hidden h-4 w-4 shrink-0 items-center justify-center rounded border sm:flex ${
          selected
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        {selected && <Check className="h-3 w-3" />}
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(
            creator.name
          )}`}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {creator.name}
            </p>
            {creator.linkedin_url && (
              <a
                href={creator.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-600 text-white"
              >
                <LinkedinIcon className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
          <p className="truncate text-xs text-zinc-500">{reason}</p>
        </div>
      </div>
      <div className="hidden shrink-0 text-right text-xs text-zinc-400 sm:block">
        {creator.industry_tags.slice(0, 2).join(" · ")}
        {creator.country ? ` · ${creator.country}` : ""}
      </div>
      <div className="grid shrink-0 grid-cols-3 gap-4 text-right">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {creator.median_views != null ? formatK(creator.median_views) : "—"}
          </p>
          <p className="text-[9px] font-medium text-zinc-400">MEDIAN VIEWS</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {creator.cpm != null ? `€${creator.cpm}` : "—"}
          </p>
          <p className="text-[9px] font-medium text-zinc-400">CPM</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            €{creator.price_per_post}
          </p>
          <p className="text-[9px] font-medium text-zinc-400">POST COST</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onBook}
          className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Book
        </button>
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            saved
              ? "border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-800 dark:bg-amber-950"
              : "border-zinc-200 text-zinc-400 hover:text-amber-500 dark:border-zinc-800"
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
        </button>
        <button
          type="button"
          onClick={onViewProfile}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:bg-zinc-50 dark:border-zinc-800"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function AIMatchingView({
  companyName,
  creators,
  actions,
}: {
  companyName: string;
  creators: Creator[];
  actions: CreatorActions;
}) {
  const { selectedIds, savedIds, toggleSelected, toggleSaved, openModal } = actions;
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ summary: string; matches: MatchedRow[] } | null>(
    null
  );

  async function runQuery(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    const response = await matchCreatorsWithAI(trimmed);
    setSubmitting(false);
    if (!response.ok) {
      setError(response.error);
      setResult(null);
      return;
    }
    const byId = new Map(creators.map((c) => [c.id, c]));
    const matches: MatchedRow[] = response.matches
      .map((m) => {
        const creator = byId.get(m.creatorId);
        return creator ? { creator, reason: m.reason } : null;
      })
      .filter((m): m is MatchedRow => m !== null);
    setResult({ summary: response.summary, matches });
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col items-center rounded-3xl bg-gradient-to-b from-sky-100 to-sky-50 px-6 py-10 text-center dark:from-sky-950 dark:to-zinc-950">
        {!result && !submitting && (
          <>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <Cloud className="h-9 w-9 text-zinc-300" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-blue-600" />
            </div>
            <h2 className="mt-5 max-w-lg text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Hey {companyName}, let&apos;s find the right creators for you.
            </h2>
          </>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runQuery(query);
          }}
          className={`flex w-full max-w-xl items-center gap-3 rounded-full bg-white px-5 py-3.5 shadow-sm dark:bg-zinc-950 ${
            !result && !submitting ? "mt-6" : ""
          }`}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Nao a question, or find creators..."
            disabled={submitting}
            className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-60 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={submitting || !query.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </form>

        {!result && !submitting && (
          <div className="mt-8 w-full max-w-xl text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Suggested for you
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuery(s);
                    runQuery(s);
                  }}
                  className="rounded-xl bg-white px-4 py-3 text-left text-sm text-zinc-700 shadow-sm hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {submitting && (
        <div className="mt-6 flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing your creators…
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {result && !submitting && (
        <div className="mt-6">
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-950">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {result.summary}
            </p>
          </div>

          {result.matches.length === 0 ? (
            <p className="mt-6 py-12 text-center text-sm text-zinc-500">
              No creators matched that request. Try describing the audience
              or topic differently.
            </p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              {result.matches.map((m, i) => (
                <MatchedCreatorRow
                  key={m.creator.id}
                  rank={i + 1}
                  creator={m.creator}
                  reason={m.reason}
                  selected={selectedIds.has(m.creator.id)}
                  onToggleSelect={() => toggleSelected(m.creator.id)}
                  saved={savedIds.has(m.creator.id)}
                  onToggleSave={() => toggleSaved(m.creator.id)}
                  onBook={() => openModal({ view: "book", creator: m.creator })}
                  onViewProfile={() =>
                    openModal({ view: "profile", creator: m.creator })
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CreatorsClient({
  creators,
  companyName,
  primaryIndustry,
  campaigns,
}: {
  creators: Creator[];
  companyName: string;
  primaryIndustry: string;
  campaigns: CampaignOption[];
}) {
  const [mode, setMode] = useState<"marketplace" | "ai">("marketplace");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Mock-only for now: there's no saved_creators table, and a real one
  // would need creator_id to reference the real `creators` table, which
  // the mock creators used for testing (src/lib/mock-creators.ts) aren't
  // rows in. Isolated here so swapping this for a real Supabase-backed
  // save doesn't touch any card/row JSX at all — only these two handlers.
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [inviteModal, setInviteModal] = useState<InviteModalState>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSaved(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const actions: CreatorActions = {
    selectedIds,
    savedIds,
    toggleSelected,
    toggleSaved,
    openModal: setInviteModal,
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            All creators
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">
            All creators are shown from most to least relevant, using sector
            fit first and verified performance statistics to refine the
            order.
          </p>
        </div>
        <div className="flex shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium ${
              mode === "ai"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-500"
            }`}
          >
            <Shuffle className="h-4 w-4" />
            AI Matching
          </button>
          <button
            type="button"
            onClick={() => setMode("marketplace")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium ${
              mode === "marketplace"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-500"
            }`}
          >
            <Users className="h-4 w-4" />
            Creator Marketplace
          </button>
        </div>
      </div>

      {mode === "marketplace" ? (
        <MarketplaceView
          creators={creators}
          primaryIndustry={primaryIndustry}
          actions={actions}
        />
      ) : (
        <AIMatchingView
          companyName={companyName}
          creators={creators}
          actions={actions}
        />
      )}

      {successMessage && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            {successMessage}
          </div>
        </div>
      )}

      {selectedIds.size > 0 && !inviteModal && (
        <SelectionBar
          creators={creators}
          selectedIds={selectedIds}
          onCancel={() => setSelectedIds(new Set())}
          onInvite={() => setInviteModal({ view: "group" })}
        />
      )}

      {inviteModal?.view === "group" && (
        <GroupSelectionModal
          creators={creators.filter((c) => selectedIds.has(c.id))}
          campaigns={campaigns}
          onClose={() => setInviteModal(null)}
          onSuccess={() => {
            setInviteModal(null);
            setSelectedIds(new Set());
            setSuccessMessage("Invitations sent.");
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      )}

      {inviteModal?.view === "profile" && (
        <ViewProfileModal
          creator={inviteModal.creator}
          saved={savedIds.has(inviteModal.creator.id)}
          onToggleSave={() => toggleSaved(inviteModal.creator.id)}
          onClose={() => setInviteModal(null)}
          onCollaborate={() =>
            setInviteModal({ view: "book", creator: inviteModal.creator })
          }
        />
      )}

      {inviteModal?.view === "book" && (
        <BookingModal
          creator={inviteModal.creator}
          campaigns={campaigns}
          onClose={() => setInviteModal(null)}
          onNegotiate={() =>
            setInviteModal({ view: "negotiate", creator: inviteModal.creator })
          }
          onSuccess={() => {
            setInviteModal(null);
            setSuccessMessage("Booking sent.");
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      )}

      {inviteModal?.view === "negotiate" && (
        <NegotiationModal
          creator={inviteModal.creator}
          campaigns={campaigns}
          onBack={() =>
            setInviteModal({ view: "book", creator: inviteModal.creator })
          }
          onClose={() => setInviteModal(null)}
          onSuccess={() => {
            setInviteModal(null);
            setSuccessMessage("Offer sent.");
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      )}
    </div>
  );
}
