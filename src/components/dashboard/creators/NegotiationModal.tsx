"use client";

import { useState } from "react";
import { ArrowLeft, Info, Loader2, X } from "lucide-react";
import type { Creator } from "./CreatorsClient";
import { createNegotiatedInvite } from "@/app/brand/creators/actions";
import {
  defaultPostByDate,
  daysFromNow,
  type CampaignOption,
  type WorkMode,
} from "./invite-shared";

const DISCOUNTS = [10, 20, 30] as const;

export function NegotiationModal({
  creator,
  campaigns,
  onBack,
  onClose,
  onSuccess,
}: {
  creator: Creator;
  campaigns: CampaignOption[];
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [discount, setDiscount] = useState<number | "other">(20);
  const [customOffer, setCustomOffer] = useState(
    String(Math.round(creator.price_per_post * 0.8 * 100) / 100)
  );
  const [postByDate, setPostByDate] = useState(defaultPostByDate());
  const [workMode, setWorkMode] = useState<WorkMode>("specific_brief");
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "");
  const [approveBeforePublishing, setApproveBeforePublishing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickDiscount(pct: number) {
    setDiscount(pct);
    setCustomOffer(
      String(Math.round(creator.price_per_post * (1 - pct / 100) * 100) / 100)
    );
  }

  const offerAmount = Number(customOffer) || 0;
  const discountPct =
    creator.price_per_post > 0
      ? Math.round((1 - offerAmount / creator.price_per_post) * 100)
      : 0;

  async function handleSubmit() {
    if (!campaignId) {
      setError("Choose a campaign for this offer.");
      return;
    }
    if (!Number.isFinite(offerAmount) || offerAmount <= 0) {
      setError("Enter a valid offer amount.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("campaign_id", campaignId);
    fd.set("creator_id", creator.id);
    fd.set("amount", String(offerAmount));
    fd.set("post_by_date", postByDate);
    fd.set("work_mode", workMode);
    fd.set("content_approval", approveBeforePublishing ? "manual" : "auto");

    const result = await createNegotiatedInvite(fd);
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
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Make an offer
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
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
              {creator.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {creator.name} · Single post
              </p>
              <p className="text-sm text-zinc-500">
                Current price: {creator.price_per_post} € per post
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Choose a discount
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {DISCOUNTS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => pickDiscount(pct)}
                  className={`rounded-xl border p-3 text-center ${
                    discount === pct
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <p
                    className={`text-sm font-bold ${
                      discount === pct
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {Math.round(creator.price_per_post * (1 - pct / 100) * 100) / 100} €
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {pct}% discount
                  </p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setDiscount("other")}
                className={`rounded-xl border p-3 text-center ${
                  discount === "other"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Other
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  Enter a price
                </p>
              </button>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            Your offer
            <div className="flex items-center rounded-lg border border-zinc-300 px-3 py-2.5 dark:border-zinc-700">
              <input
                type="number"
                min={0}
                step="0.01"
                value={customOffer}
                onChange={(e) => {
                  setCustomOffer(e.target.value);
                  setDiscount("other");
                }}
                className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-50"
              />
              <span className="text-sm text-zinc-400">€</span>
            </div>
            <span className="text-xs text-zinc-400">
              The creator will see a {Math.max(discountPct, 0)}% discount
              request.
            </span>
          </label>

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

          <label className="flex flex-col gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            Campaign
            {campaigns.length === 0 ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                You need an active campaign before sending an offer.
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

          <label className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={approveBeforePublishing}
              onChange={(e) => setApproveBeforePublishing(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300"
            />
            I want to approve the content before it is published.
          </label>

          <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            The creator receives the offer immediately and can accept or
            decline it within 48 hours.
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || campaigns.length === 0}
            className="flex items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add {offerAmount.toFixed(2)} € and continue
          </button>
        </div>
      </div>
    </div>
  );
}
