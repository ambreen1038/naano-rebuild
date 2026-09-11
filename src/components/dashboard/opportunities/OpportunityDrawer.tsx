"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Check,
  ClipboardCopy,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";
import type { OpportunityCampaignWithMatch } from "./OpportunitiesClient";

function buildMarkdown(c: OpportunityCampaignWithMatch) {
  const lines = [`# ${c.name}`, ""];
  if (c.brand?.company_name) lines.push(`**Brand:** ${c.brand.company_name}`, "");
  if (c.objective) lines.push("## Campaign Objectives", c.objective, "");
  if (c.target_audience) lines.push("## Target Audience", c.target_audience, "");
  if (c.cta_do || c.cta_dont) {
    lines.push("## Call to Action");
    if (c.cta_do) lines.push(`- Do: ${c.cta_do}`);
    if (c.cta_dont) lines.push(`- Don't: ${c.cta_dont}`);
    lines.push("");
  }
  if (c.content_angles.length > 0) {
    lines.push("## Content Angles", ...c.content_angles.map((a) => `- ${a}`), "");
  }
  return lines.join("\n").trim();
}

function buildAiPrompt(c: OpportunityCampaignWithMatch) {
  const parts = [
    `Write a LinkedIn post for the campaign "${c.name}".`,
  ];
  if (c.objective) parts.push(`Objective: ${c.objective}`);
  if (c.target_audience) parts.push(`Target audience: ${c.target_audience}`);
  if (c.tone) parts.push(`Tone: ${c.tone}`);
  if (c.cta_do) parts.push(`Do: ${c.cta_do}`);
  if (c.cta_dont) parts.push(`Avoid: ${c.cta_dont}`);
  if (c.content_angles.length > 0) {
    parts.push(`Consider one of these angles: ${c.content_angles.join(", ")}`);
  }
  return parts.join("\n");
}

function CopyButton({
  getText,
  label,
  icon,
  className,
}: {
  getText: () => string;
  label: string;
  icon: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(getText());
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={className}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : icon}
      {copied ? "Copied" : label}
    </button>
  );
}

export function OpportunityDrawer({
  campaign,
  applied,
  applying,
  applyError,
  onClose,
  onApply,
}: {
  campaign: OpportunityCampaignWithMatch;
  applied: boolean;
  applying: boolean;
  applyError: string | null;
  onClose: () => void;
  onApply: () => void;
}) {
  const initial = (campaign.brand?.company_name || campaign.name)
    .charAt(0)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between border-b border-zinc-100 p-6 dark:border-zinc-900">
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
              {campaign.brand?.website && (
                <a
                  href={campaign.brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  {campaign.brand.website.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
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

        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                {campaign.name}
              </h2>
              <p className="text-sm text-zinc-500">Main campaign</p>
            </div>
            <CopyButton
              getText={() => buildMarkdown(campaign)}
              label="Copy as Markdown"
              icon={<ClipboardCopy className="h-3.5 w-3.5" />}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
            />
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-950 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
              Create my post with AI
            </div>
            <p className="mt-1.5 text-xs text-blue-700/80 dark:text-blue-300/80">
              Copy this brief-based prompt into your AI writing tool of
              choice to draft a first pass.
            </p>
            <CopyButton
              getText={() => buildAiPrompt(campaign)}
              label="Copy for my AI"
              icon={<ClipboardCopy className="h-3.5 w-3.5" />}
              className="mt-3 flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            />
          </div>

          {campaign.objective && (
            <section>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Campaign Objectives
              </h3>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                {campaign.objective}
              </p>
            </section>
          )}

          {campaign.target_audience && (
            <section>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Target Audience
              </h3>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                {campaign.target_audience}
              </p>
            </section>
          )}

          {(campaign.cta_do || campaign.cta_dont) && (
            <section>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Call to Action
              </h3>
              <div className="mt-1.5 space-y-1.5 text-sm">
                {campaign.cta_do && (
                  <p className="text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-emerald-600">Do:</span>{" "}
                    {campaign.cta_do}
                  </p>
                )}
                {campaign.cta_dont && (
                  <p className="text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-red-500">Don&apos;t:</span>{" "}
                    {campaign.cta_dont}
                  </p>
                )}
              </div>
            </section>
          )}

          {campaign.content_angles.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Content Angles
              </h3>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                {campaign.content_angles.map((angle) => (
                  <li key={angle}>{angle}</li>
                ))}
              </ul>
            </section>
          )}

          {!campaign.objective &&
            !campaign.target_audience &&
            !campaign.cta_do &&
            !campaign.cta_dont &&
            campaign.content_angles.length === 0 && (
              <p className="text-sm text-zinc-400">
                This brand hasn&apos;t added brief details to this campaign
                yet.
              </p>
            )}
        </div>

        <div className="border-t border-zinc-100 p-6 dark:border-zinc-900">
          {applyError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {applyError}
            </p>
          )}
          <button
            type="button"
            disabled={applied || applying}
            onClick={onApply}
            className="w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applied
              ? "Applied"
              : applying
                ? "Applying…"
                : "Apply to this campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}
