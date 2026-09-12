"use client";

import { useState } from "react";
import { ArrowLeftRight, FileText, Loader2, X } from "lucide-react";
import type { Creator } from "./CreatorsClient";
import { createDirectBooking } from "@/app/brand/creators/actions";
import { defaultPostByDate, type CampaignOption } from "./invite-shared";

export function BookingModal({
  creator,
  campaigns,
  onClose,
  onNegotiate,
  onSuccess,
}: {
  creator: Creator;
  campaigns: CampaignOption[];
  onClose: () => void;
  onNegotiate: () => void;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBook() {
    if (campaigns.length === 0) {
      setError("You need an active campaign before booking a creator.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("campaign_id", campaigns[0].id);
    fd.set("post_by_date", defaultPostByDate());
    fd.set("work_mode", "specific_brief");
    fd.set("content_approval", "auto");
    fd.append("creator_id", creator.id);
    fd.append("price", String(creator.price_per_post));

    const result = await createDirectBooking(fd);
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
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Your selection
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Creator rate
              </p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                Single post
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                {creator.price_per_post} €
              </p>
              <p className="text-xs text-zinc-400">Standard rate</p>
            </div>
          </div>

          <p className="mt-3 text-sm text-zinc-500">
            Book this option at the listed price, or propose a lower price.
          </p>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onNegotiate}
              className="flex items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Negotiate
            </button>
            <button
              type="button"
              onClick={handleBook}
              disabled={submitting}
              className="flex items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Book · {creator.price_per_post} €
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
