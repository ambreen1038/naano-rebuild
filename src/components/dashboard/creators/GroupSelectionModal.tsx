"use client";

import { useState } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";
import type { Creator } from "./CreatorsClient";
import { createInvites } from "@/app/brand/creators/actions";
import {
  defaultPostByDate,
  daysFromNow,
  type CampaignOption,
  type ContentApproval,
  type WorkMode,
} from "./invite-shared";

export function GroupSelectionModal({
  creators,
  campaigns,
  onClose,
  onSuccess,
}: {
  creators: Creator[];
  campaigns: CampaignOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [postByDate, setPostByDate] = useState(defaultPostByDate());
  const [workMode, setWorkMode] = useState<WorkMode>("specific_brief");
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [contentApproval, setContentApproval] = useState<ContentApproval>("auto");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = creators.reduce((sum, c) => sum + c.price_per_post, 0);

  async function handleSubmit() {
    if (workMode === "specific_brief" && !campaignId) {
      setError("Choose a campaign, or switch to Creative freedom.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("campaign_id", campaignId);
    fd.set("post_by_date", postByDate);
    fd.set("work_mode", workMode);
    fd.set("content_approval", contentApproval);
    creators.forEach((c) => {
      fd.append("creator_id", c.id);
      fd.append("price", String(c.price_per_post));
    });

    const result = await createInvites(fd);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Group selection
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-center dark:border-blue-950 dark:bg-blue-950/30">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Your total offer
            </p>
            <p className="mt-1 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              {total}
              <span className="text-2xl">€</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Calculated from each creator offer
            </p>
            <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
              {creators.length} creator{creators.length === 1 ? "" : "s"}
            </span>

            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              className="mt-4 flex w-full items-center justify-between border-t border-blue-100 pt-3 text-sm font-medium text-zinc-700 dark:border-blue-900 dark:text-zinc-300"
            >
              View creator details
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform ${
                  detailsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {detailsOpen && (
              <div className="mt-2 flex flex-col gap-1.5 text-left">
                {creators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm dark:bg-zinc-900"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {c.name}
                    </span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                      €{c.price_per_post}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex flex-col gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            Post by
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={postByDate}
                onChange={(e) => setPostByDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <span className="shrink-0 rounded-lg bg-zinc-100 px-3 py-2.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900">
                {daysFromNow(postByDate)} days from now
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              Latest date the creator must publish the post. Defaults to 14
              days.
            </span>
          </label>

          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              How should the creator work?
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  {
                    value: "specific_brief" as WorkMode,
                    title: "Specific brief",
                    desc: "Use detailed instructions from one of your campaign briefs.",
                  },
                  {
                    value: "creative_freedom" as WorkMode,
                    title: "Creative freedom",
                    desc: "Let the creator choose the best format and angle.",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setWorkMode(opt.value)}
                  className={`rounded-xl border p-3 text-left ${
                    workMode === opt.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      workMode === opt.value
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {opt.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {workMode === "specific_brief" && (
            <label className="flex flex-col gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              Invitation campaign
              {campaigns.length === 0 ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  You need an active campaign before inviting creators.
                </p>
              ) : (
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </label>
          )}

          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Content approval
            </p>
            <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setContentApproval("auto")}
                className={`px-3 py-2.5 text-sm font-medium ${
                  contentApproval === "auto"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400"
                }`}
              >
                Publish without approval
              </button>
              <button
                type="button"
                onClick={() => setContentApproval("manual")}
                className={`px-3 py-2.5 text-sm font-medium ${
                  contentApproval === "manual"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400"
                }`}
              >
                Approve before publishing
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || (workMode === "specific_brief" && campaigns.length === 0)}
            className="flex items-center justify-center gap-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add {total} € and continue
          </button>
        </div>
      </div>
    </div>
  );
}
