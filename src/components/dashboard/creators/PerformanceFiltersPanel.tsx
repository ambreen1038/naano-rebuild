"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export type PerformanceFilters = {
  maxCpm: string;
  minMedianViews: string;
  minFollowers: string;
  maxFollowers: string;
  minEngagement: string;
  postedRecently: "any" | "7" | "30" | "90";
};

export const EMPTY_PERFORMANCE_FILTERS: PerformanceFilters = {
  maxCpm: "",
  minMedianViews: "",
  minFollowers: "",
  maxFollowers: "",
  minEngagement: "",
  postedRecently: "any",
};

function isActive(f: PerformanceFilters) {
  return (
    f.maxCpm !== "" ||
    f.minMedianViews !== "" ||
    f.minFollowers !== "" ||
    f.maxFollowers !== "" ||
    f.minEngagement !== "" ||
    f.postedRecently !== "any"
  );
}

function NumberField({
  label,
  prefix,
  suffix,
  value,
  onChange,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-xs font-medium text-zinc-500">
      {label}
      <div className="mt-1 flex items-center rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
        {prefix && <span className="mr-1 text-sm text-zinc-400">{prefix}</span>}
        <input
          type="number"
          min={0}
          placeholder="Any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
        />
        {suffix && <span className="ml-1 text-sm text-zinc-400">{suffix}</span>}
      </div>
    </label>
  );
}

export function PerformanceFiltersPanel({
  value,
  onApply,
}: {
  value: PerformanceFilters;
  onApply: (next: PerformanceFilters) => void;
}) {
  const [draft, setDraft] = useState(value);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => setDraft(value), [value]);

  function close() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        className={`flex cursor-pointer list-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden ${
          isActive(value)
            ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        }`}
      >
        <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
        Filters
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-11 z-20 w-80 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
          Performance filters
        </p>
        <p className="text-xs text-zinc-500">
          These filters hide creators; matching scores stay unchanged.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <NumberField
            label="Maximum CPM"
            prefix="€"
            value={draft.maxCpm}
            onChange={(v) => setDraft({ ...draft, maxCpm: v })}
          />
          <NumberField
            label="Minimum median views"
            suffix="views"
            value={draft.minMedianViews}
            onChange={(v) => setDraft({ ...draft, minMedianViews: v })}
          />
          <NumberField
            label="Minimum followers"
            value={draft.minFollowers}
            onChange={(v) => setDraft({ ...draft, minFollowers: v })}
          />
          <NumberField
            label="Maximum followers"
            value={draft.maxFollowers}
            onChange={(v) => setDraft({ ...draft, maxFollowers: v })}
          />
          <NumberField
            label="Minimum engagement"
            suffix="%"
            value={draft.minEngagement}
            onChange={(v) => setDraft({ ...draft, minEngagement: v })}
          />
          <label className="text-xs font-medium text-zinc-500">
            Posted recently
            <select
              value={draft.postedRecently}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  postedRecently: e.target
                    .value as PerformanceFilters["postedRecently"],
                })
              }
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="any">Any time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </label>
        </div>

        <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          Creators with unavailable performance data remain visible.
        </p>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY_PERFORMANCE_FILTERS);
              onApply(EMPTY_PERFORMANCE_FILTERS);
              close();
            }}
            className="text-sm font-medium text-zinc-500 underline"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              close();
            }}
            className="rounded-full bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Apply filters
          </button>
        </div>
      </div>
    </details>
  );
}
