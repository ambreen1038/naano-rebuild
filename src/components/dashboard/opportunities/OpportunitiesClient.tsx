"use client";

import { useMemo, useState } from "react";
import { Building2, Globe, Search } from "lucide-react";
import { CheckboxListFilter } from "@/components/dashboard/creators/CheckboxListFilter";
import { INDUSTRY_TAGS } from "@/lib/industries";
import { INDUSTRY_TO_TAG } from "@/lib/industry-mapping";
import { COUNTRIES } from "@/lib/countries";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";
import { OpportunityCard } from "./OpportunityCard";
import { OpportunityDrawer } from "./OpportunityDrawer";
import { CampaignDetailsModal } from "./CampaignDetailsModal";
import { ProfessionalSetupModal } from "./ProfessionalSetupModal";
import { SortSelect, type SortValue } from "./SortSelect";
import { applyToCampaign } from "@/app/creator/(app)/opportunities/actions";
import type { MatchFactor, MatchTier } from "@/lib/campaign-match";

export type OpportunityCampaignWithMatch = {
  id: string;
  name: string;
  objective: string | null;
  channel: string;
  target_regions: string[];
  budget: number | null;
  application_deadline: string | null;
  target_audience: string | null;
  cta_do: string | null;
  cta_dont: string | null;
  tone: string | null;
  content_angles: string[];
  target_vertical: string | null;
  created_at: string;
  match: number;
  matchTier: MatchTier;
  matchFactors: MatchFactor[];
  brand: {
    company_name: string | null;
    website: string | null;
    logo_url: string | null;
  } | null;
};

type Channel = "all" | "linkedin";

type ModalState =
  | { view: "details"; campaign: OpportunityCampaignWithMatch }
  | { view: "brief"; campaign: OpportunityCampaignWithMatch }
  | { view: "setup"; campaign: OpportunityCampaignWithMatch }
  | null;

export function OpportunitiesClient({
  campaigns,
  creatorTags,
  netAmount,
  registrationCountryDefault,
  initialBillingSetupCompleted,
  initialAppliedCampaignIds,
}: {
  campaigns: OpportunityCampaignWithMatch[];
  creatorTags: string[];
  netAmount: number;
  registrationCountryDefault: string | null;
  initialBillingSetupCompleted: boolean;
  initialAppliedCampaignIds: string[];
}) {
  const [channel, setChannel] = useState<Channel>("all");
  const [search, setSearch] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [sort, setSort] = useState<SortValue>("relevance");
  const [modal, setModal] = useState<ModalState>(null);

  const [billingSetupCompleted, setBillingSetupCompleted] = useState(
    initialBillingSetupCompleted
  );
  const [appliedIds, setAppliedIds] = useState<Set<string>>(
    () => new Set(initialAppliedCampaignIds)
  );
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const result = campaigns
      .filter((c) => channel === "all" || c.channel === channel)
      .filter(
        (c) =>
          q === "" ||
          c.name.toLowerCase().includes(q) ||
          (c.brand?.company_name ?? "").toLowerCase().includes(q)
      )
      .filter((c) => {
        if (selectedIndustries.length === 0) return true;
        const tag = c.target_vertical ? INDUSTRY_TO_TAG[c.target_vertical] : null;
        return tag !== null && tag !== undefined && selectedIndustries.includes(tag);
      })
      .filter(
        (c) =>
          selectedCountries.length === 0 ||
          c.target_regions.some((r) => selectedCountries.includes(r))
      );

    const sorted = [...result];
    if (sort === "match_desc") {
      sorted.sort((a, b) => b.match - a.match);
    } else if (sort === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return sorted;
  }, [campaigns, channel, search, selectedIndustries, selectedCountries, sort]);

  function handleApply(campaign: OpportunityCampaignWithMatch) {
    setApplyError(null);
    if (!billingSetupCompleted) {
      setModal({ view: "setup", campaign });
      return;
    }
    void doApply(campaign);
  }

  async function doApply(campaign: OpportunityCampaignWithMatch) {
    setApplyError(null);
    setApplyingId(campaign.id);
    const result = await applyToCampaign(campaign.id);
    setApplyingId(null);
    if (result.ok) {
      setAppliedIds((prev) => new Set(prev).add(campaign.id));
      setModal(null);
    } else {
      setApplyError(result.error);
    }
  }

  return (
    <div className="p-8">
      <p className="text-sm text-zinc-500">Creator workspace</p>
      <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Opportunities
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Campaigns from brands that match your audience.
      </p>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setChannel("all")}
          className={`rounded-full px-3.5 py-2 text-sm font-medium ${
            channel === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
          }`}
        >
          All channels
        </button>
        <button
          type="button"
          onClick={() => setChannel("linkedin")}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium ${
            channel === "linkedin"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
          }`}
        >
          <LinkedinIcon className="h-3.5 w-3.5" />
          LinkedIn
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
          />
        </div>
        <SortSelect value={sort} onChange={setSort} />
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
        </div>
        <span className="text-sm text-zinc-500">
          {filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            No opportunities match your filters.
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Try clearing a filter or checking back soon.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <OpportunityCard
              key={c.id}
              campaign={c}
              applied={appliedIds.has(c.id)}
              applying={applyingId === c.id}
              onOpen={(campaign) => setModal({ view: "details", campaign })}
              onApply={handleApply}
            />
          ))}
        </div>
      )}

      {modal?.view === "details" && (
        <CampaignDetailsModal
          campaign={modal.campaign}
          creatorTags={creatorTags}
          netAmount={netAmount}
          applied={appliedIds.has(modal.campaign.id)}
          applying={applyingId === modal.campaign.id}
          applyError={applyError}
          onClose={() => setModal(null)}
          onSeeBrief={() => setModal({ view: "brief", campaign: modal.campaign })}
          onApply={() => handleApply(modal.campaign)}
        />
      )}

      {modal?.view === "brief" && (
        <OpportunityDrawer
          campaign={modal.campaign}
          applied={appliedIds.has(modal.campaign.id)}
          applying={applyingId === modal.campaign.id}
          applyError={applyError}
          onClose={() => setModal(null)}
          onApply={() => handleApply(modal.campaign)}
        />
      )}

      {modal?.view === "setup" && (
        <ProfessionalSetupModal
          defaultCountry={registrationCountryDefault}
          onClose={() => setModal(null)}
          onSaved={() => {
            setBillingSetupCompleted(true);
            void doApply(modal.campaign);
          }}
        />
      )}
    </div>
  );
}
