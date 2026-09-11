"use client";

import { useMemo } from "react";
import { ChevronDown, Euro } from "lucide-react";

export function PriceRangeFilter({
  allPrices,
  min,
  max,
  value,
  onChange,
}: {
  allPrices: number[];
  min: number;
  max: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  const buckets = useMemo(() => {
    const bucketCount = 24;
    const span = Math.max(max - min, 1);
    const counts = new Array(bucketCount).fill(0);
    allPrices.forEach((p) => {
      const idx = Math.min(
        bucketCount - 1,
        Math.max(0, Math.floor(((p - min) / span) * bucketCount))
      );
      counts[idx] += 1;
    });
    const maxCount = Math.max(...counts, 1);
    return counts.map((c) => c / maxCount);
  }, [allPrices, min, max]);

  const [lo, hi] = value;
  const isActive = lo > min || hi < max;

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 [&::-webkit-details-marker]:hidden hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        <Euro className="h-4 w-4 text-zinc-400" />
        Price
        {isActive && (
          <span className="rounded-full bg-blue-600 px-1.5 text-[11px] text-white">
            1
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 top-11 z-20 w-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
          Price range
        </p>
        <p className="text-xs text-zinc-500">Price per sponsored post</p>

        <div className="mt-4 flex h-12 items-end gap-[2px]">
          {buckets.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-blue-200 dark:bg-blue-900"
              style={{ height: `${Math.max(h * 100, 4)}%` }}
            />
          ))}
        </div>

        <div className="relative mt-2 h-5">
          <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-600"
            style={{
              left: `${((lo - min) / (max - min)) * 100}%`,
              right: `${100 - ((hi - min) / (max - min)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            value={lo}
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), hi - 1);
              onChange([next, hi]);
            }}
            className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={hi}
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), lo + 1);
              onChange([lo, next]);
            }}
            className="range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-zinc-500">
            Minimum
            <div className="mt-1 flex items-center rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <span className="mr-1 text-sm text-zinc-400">€</span>
              <input
                type="number"
                value={lo}
                onChange={(e) =>
                  onChange([Math.min(Number(e.target.value), hi - 1), hi])
                }
                className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-50"
              />
            </div>
          </label>
          <label className="text-xs font-medium text-zinc-500">
            Maximum
            <div className="mt-1 flex items-center rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <span className="mr-1 text-sm text-zinc-400">€</span>
              <input
                type="number"
                value={hi}
                onChange={(e) =>
                  onChange([lo, Math.max(Number(e.target.value), lo + 1)])
                }
                className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-50"
              />
              {hi >= max && (
                <span className="ml-1 text-sm text-zinc-400">+</span>
              )}
            </div>
          </label>
        </div>
      </div>
    </details>
  );
}
