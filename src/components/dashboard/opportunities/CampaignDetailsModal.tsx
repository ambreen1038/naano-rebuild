"use client";

import Image from "next/image";
import { ChevronDown, FileText, X } from "lucide-react";
import { tagColor } from "@/lib/tag-color";
import { channelLabel } from "@/lib/channel-label";
import { MATCH_TIER_LABEL, type MatchTier } from "@/lib/campaign-match";
import type { OpportunityCampaignWithMatch } from "./OpportunitiesClient";

const TIER_COLORS: Record<MatchTier, { dot: string; text: string; bg: string }> = {
  strong: { dot: "bg-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50" },
  partial: { dot: "bg-blue-600", text: "text-blue-700", bg: "bg-blue-50" },
  limited: { dot: "bg-amber-600", text: "text-amber-700", bg: "bg-amber-50" },
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

export function CampaignDetailsModal({
  campaign,
  creatorTags,
  netAmount,
  applied,
  applying,
  applyError,
  onClose,
  onSeeBrief,
  onApply,
}: {
  campaign: OpportunityCampaignWithMatch;
  creatorTags: string[];
  netAmount: number;
  applied: boolean;
  applying: boolean;
  applyError: string | null;
  onClose: () => void;
  onSeeBrief: () => void;
  onApply: () => void;
}) {
  const initial = (campaign.brand?.company_name || campaign.name)
    .charAt(0)
    .toUpperCase();
  const tierColors = TIER_COLORS[campaign.matchTier];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {campaign.brand?.logo_url ? (
              <Image
                src={campaign.brand.logo_url}
                alt={campaign.brand.company_name ?? campaign.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-xl object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-lg font-bold text-white">
                {initial}
              </div>
            )}
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {campaign.brand?.company_name ?? campaign.name}
              </p>
              <p className="text-sm text-zinc-500">
                Main campaign
                {campaign.brand?.website && (
                  <> · {campaign.brand.website.replace(/^https?:\/\//, "")}</>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tierColors.bg} ${tierColors.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tierColors.dot}`} />
            {campaign.match}% match
          </span>
          {creatorTags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${tagColor(
                tag
              )}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-zinc-100 rounded-xl border border-zinc-100 py-3 dark:divide-zinc-800 dark:border-zinc-900">
          <div className="text-center">
            <p className="text-xs text-zinc-500">Your net</p>
            <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-zinc-50">
              €{netAmount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Channel</p>
            <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {channelLabel(campaign.channel)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500">Post deadline</p>
            <p className="mt-0.5 text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {deadlineLabel(campaign.application_deadline)}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          If the brand accepts your application, you&apos;ll get a booking
          invite at your listed rate — from there you can accept, decline,
          or negotiate it like any other invite.
        </p>

        <details className="group mt-3 rounded-xl border border-zinc-100 dark:border-zinc-900">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-zinc-700 [&::-webkit-details-marker]:hidden dark:text-zinc-300">
            Why {MATCH_TIER_LABEL[campaign.matchTier].toLowerCase()} ({campaign.match}/100)
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-col gap-2 px-3.5 pb-3.5">
            {campaign.matchFactors.map((factor) => (
              <div key={factor.key} className="flex items-start justify-between gap-3 text-xs">
                <p className="text-zinc-500">{factor.reason}</p>
                <span
                  className={`shrink-0 font-semibold ${
                    factor.points === factor.maxPoints
                      ? "text-emerald-600"
                      : "text-zinc-400"
                  }`}
                >
                  {factor.points}/{factor.maxPoints}
                </span>
              </div>
            ))}
          </div>
        </details>

        {applyError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            {applyError}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onSeeBrief}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
          >
            <FileText className="h-4 w-4" />
            See Brief
          </button>
          <button
            type="button"
            disabled={applied || applying}
            onClick={onApply}
            className="flex-1 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applied ? "Applied" : applying ? "Applying…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
