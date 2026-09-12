"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { updatePricingAndBundle } from "@/app/creator/(app)/card/actions";
import { estimatedRange } from "@/lib/price-recommendation";

export function EditPriceBundleModal({
  pricePerPost,
  bundlePrice,
  bundlePostCount,
  followerCount,
  onClose,
  onSaved,
}: {
  pricePerPost: number;
  bundlePrice: number | null;
  bundlePostCount: number | null;
  followerCount: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [price, setPrice] = useState(String(pricePerPost));
  const [hasBundle, setHasBundle] = useState(bundlePrice != null && bundlePostCount != null);
  const [bundleCount, setBundleCount] = useState(String(bundlePostCount ?? 5));
  const [bundleAmount, setBundleAmount] = useState(String(bundlePrice ?? ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = estimatedRange(followerCount);

  async function handleSave() {
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("price_per_post", price);
    if (hasBundle) {
      fd.set("bundle_price", bundleAmount);
      fd.set("bundle_post_count", bundleCount);
    }

    const result = await updatePricingAndBundle(fd);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Edit price & bundles
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Your net price (what you receive)
          </p>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2.5 dark:border-zinc-700">
            <span className="text-sm text-zinc-400">€</span>
            <input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-50"
            />
            <span className="shrink-0 text-sm text-zinc-400">/ post</span>
          </div>

          <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Indicative estimate
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                €{estimate.low} – €{estimate.high} / post
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                A simple formula from your follower count, not real market
                data — use it as a starting point.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPrice(String(Math.round((estimate.low + estimate.high) / 2)))}
              className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-zinc-950 dark:text-amber-400"
            >
              Use €{Math.round((estimate.low + estimate.high) / 2)}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Bundle (optional)
            </p>
          </div>

          {hasBundle ? (
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2.5 dark:border-zinc-700">
              <input
                type="number"
                min={1}
                value={bundleCount}
                onChange={(e) => setBundleCount(e.target.value)}
                className="w-16 bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-50"
              />
              <span className="shrink-0 text-sm text-zinc-400">posts for</span>
              <span className="text-sm text-zinc-400">€</span>
              <input
                type="number"
                min={0}
                value={bundleAmount}
                onChange={(e) => setBundleAmount(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-50"
              />
              <button
                type="button"
                onClick={() => setHasBundle(false)}
                aria-label="Remove bundle"
                className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHasBundle(true)}
              className="mt-1.5 w-full rounded-lg border border-dashed border-zinc-300 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              + Add a bundle
            </button>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || !price.trim()}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
