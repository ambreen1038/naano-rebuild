"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ShieldCheck, Star, X } from "lucide-react";
import { avatarColor } from "@/lib/avatar-color";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";
import type { Creator } from "./CreatorsClient";

function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

type Tab = "overview" | "audience" | "content";

export function ViewProfileModal({
  creator,
  saved,
  onToggleSave,
  onClose,
  onCollaborate,
}: {
  creator: Creator;
  /** Omit both when the caller has no saved-creators state to show (e.g.
   * viewed from a context outside the Creators marketplace) — the star is
   * hidden entirely rather than shown inert and clickable-looking. */
  saved?: boolean;
  onToggleSave?: () => void;
  onClose: () => void;
  onCollaborate: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [pricingOpen, setPricingOpen] = useState(false);
  const initial = creator.name.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-950">
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-start justify-between border-b border-zinc-100 p-6 dark:border-zinc-900">
            <div className="flex items-center gap-3">
              {creator.avatar_url ? (
                <Image
                  src={creator.avatar_url}
                  alt={creator.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm"
                  unoptimized
                />
              ) : (
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-white text-lg font-semibold text-white shadow-sm ${avatarColor(
                    creator.name
                  )}`}
                >
                  {initial}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  {creator.name}
                </h2>
                <p className="text-sm text-zinc-500">
                  {creator.industry_tags.slice(0, 2).join(" · ")}
                  {creator.industry_tags.length > 0 && " · "}
                  LinkedIn creator
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onToggleSave && (
                <button
                  type="button"
                  onClick={onToggleSave}
                  aria-pressed={saved}
                  aria-label={saved ? "Unsave creator" : "Save creator"}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                    saved
                      ? "border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-800 dark:bg-amber-950"
                      : "border-zinc-200 text-zinc-400 hover:text-amber-500 dark:border-zinc-800"
                  }`}
                >
                  <Star className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 border-b border-zinc-200 px-6 dark:border-zinc-800">
            {(
              [
                { value: "overview" as Tab, label: "Overview" },
                { value: "audience" as Tab, label: "Audience" },
                { value: "content" as Tab, label: "Content" },
              ] as const
            ).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={`py-3 text-sm font-medium ${
                  tab === t.value
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "overview" && (
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    Creator overview
                  </h3>
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  Review this creator&apos;s audience and recent content
                  before booking.
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  {creator.industry_tags.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950">
                        ✓
                      </span>
                      Focused on {creator.industry_tags.join(", ")}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950">
                      ✓
                    </span>
                    {creator.median_views != null
                      ? `${formatK(creator.median_views)} typical reach`
                      : "Typical reach not available yet"}
                  </div>
                  {creator.country && (
                    <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950">
                        ✓
                      </span>
                      Based in {creator.country}
                    </div>
                  )}
                </div>

                {creator.headline && (
                  <p className="mt-5 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    &ldquo;{creator.headline}&rdquo;
                  </p>
                )}
              </div>
            )}

            {tab === "audience" && (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
                <p className="font-medium text-zinc-700 dark:text-zinc-300">
                  Audience demographics aren&apos;t available
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  A breakdown by job title or seniority requires LinkedIn&apos;s
                  gated Marketing Developer Platform, which isn&apos;t part of
                  this integration.
                </p>
              </div>
            )}

            {tab === "content" && (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
                <p className="font-medium text-zinc-700 dark:text-zinc-300">
                  No public post data available
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  LinkedIn doesn&apos;t offer an API for reading a member&apos;s
                  public post history.
                </p>
                {creator.linkedin_url && (
                  <a
                    href={creator.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                  >
                    <LinkedinIcon className="h-3.5 w-3.5" />
                    View public LinkedIn profile
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-zinc-100 p-6 sm:flex dark:border-zinc-900">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Book this creator
          </h3>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-xl border-2 border-blue-500 bg-blue-50/50 p-3 dark:bg-blue-950/30">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-blue-600">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              </span>
              <span className="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Single post
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {creator.price_per_post} €
              </span>
            </div>
            {creator.bundle_price != null && (
              <div className="flex items-center gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                <span className="h-4 w-4 shrink-0 rounded-full border-2 border-zinc-300 dark:border-zinc-700" />
                <span className="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Bundle · 5
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {creator.bundle_price} €
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Typical reach</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {creator.median_views != null ? formatK(creator.median_views) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Estimated CPM</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {creator.cpm != null ? `${creator.cpm} €` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Posts analyzed</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">—</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setPricingOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
            >
              How pricing is calculated
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  pricingOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {pricingOpen && (
              <p className="mt-2 px-1 text-xs text-zinc-500">
                This price is set directly by {creator.name.split(" ")[0]},
                not calculated by Naano.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onCollaborate}
            className="mt-auto rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Collaborate with {creator.name}
          </button>
        </div>
      </div>
    </div>
  );
}
