import Image from "next/image";
import { FileText, Globe } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";
import { channelLabel } from "@/lib/channel-label";
import { MATCH_TIER_LABEL, type MatchTier } from "@/lib/campaign-match";
import type { OpportunityCampaignWithMatch } from "./OpportunitiesClient";

const TIER_COLORS: Record<MatchTier, { dot: string; text: string; bar: string }> = {
  strong: { dot: "bg-emerald-600", text: "text-emerald-700", bar: "bg-emerald-600" },
  partial: { dot: "bg-blue-600", text: "text-blue-700", bar: "bg-blue-600" },
  limited: { dot: "bg-amber-600", text: "text-amber-700", bar: "bg-amber-600" },
};

function deadlineLabel(deadline: string | null) {
  if (!deadline) return "—";
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / 86_400_000
  );
  if (days < 0) return "Closed";
  if (days === 0) return "Today";
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function OpportunityCard({
  campaign,
  applied,
  applying,
  onOpen,
  onApply,
}: {
  campaign: OpportunityCampaignWithMatch;
  applied: boolean;
  applying: boolean;
  onOpen: (c: OpportunityCampaignWithMatch) => void;
  onApply: (c: OpportunityCampaignWithMatch) => void;
}) {
  const initial = (campaign.brand?.company_name || campaign.name)
    .charAt(0)
    .toUpperCase();
  const tierColors = TIER_COLORS[campaign.matchTier];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(campaign)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(campaign);
      }}
      className="cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="relative h-24 bg-gradient-to-b from-sky-100 to-sky-50 p-3 dark:from-sky-950 dark:to-zinc-950">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm">
            {campaign.channel === "linkedin" && (
              <LinkedinIcon className="h-3.5 w-3.5 text-blue-600" />
            )}
            {channelLabel(campaign.channel)}
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium shadow-sm ${tierColors.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tierColors.dot}`} />
            {campaign.match}% match
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center px-5 pb-5">
        {campaign.brand?.logo_url ? (
          <Image
            src={campaign.brand.logo_url}
            alt={campaign.brand.company_name ?? campaign.name}
            width={64}
            height={64}
            className="relative z-10 -mt-8 h-16 w-16 rounded-2xl border-4 border-white object-cover"
            unoptimized
          />
        ) : (
          <div className="relative z-10 -mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-zinc-900 text-xl font-bold text-white">
            {initial}
          </div>
        )}

        <p className="mt-3 text-center font-semibold text-zinc-900 dark:text-zinc-50">
          {campaign.name}
        </p>
        <p className="text-sm text-zinc-500">Main campaign</p>

        {campaign.target_regions.length > 0 && (
          <span className="mt-2 flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            <Globe className="h-3 w-3" />
            {campaign.target_regions.join(" · ")}
          </span>
        )}

        <div className="mt-4 w-full">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{MATCH_TIER_LABEL[campaign.matchTier]}</span>
            <span className={`font-semibold ${tierColors.text}`}>
              {campaign.match}/100
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-900">
            <div
              className={`h-1.5 rounded-full ${tierColors.bar}`}
              style={{ width: `${campaign.match}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid w-full grid-cols-3 divide-x divide-zinc-100 rounded-xl bg-zinc-50 py-3 dark:divide-zinc-800 dark:bg-zinc-900">
          <div className="text-center">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {campaign.match}/100
            </p>
            <p className="text-[9px] font-medium text-zinc-400">MATCH</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {channelLabel(campaign.channel)}
            </p>
            <p className="text-[9px] font-medium text-zinc-400">CHANNEL</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {deadlineLabel(campaign.application_deadline)}
            </p>
            <p className="text-[9px] font-medium text-zinc-400">
              POST DEADLINE
            </p>
          </div>
        </div>

        <div className="mt-4 flex w-full gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(campaign);
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
          >
            <FileText className="h-4 w-4" />
            View the brief
          </button>
          <button
            type="button"
            disabled={applied || applying}
            onClick={(e) => {
              e.stopPropagation();
              onApply(campaign);
            }}
            className="flex-1 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applied ? "Applied" : applying ? "Applying…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
