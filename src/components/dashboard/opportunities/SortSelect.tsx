"use client";

import { useRef } from "react";
import { ChevronDown } from "lucide-react";

export type SortValue = "relevance" | "match_desc" | "newest";

const OPTIONS: { value: SortValue; label: string }[] = [
  { value: "relevance", label: "Relevance (default)" },
  { value: "match_desc", label: "Match: high to low" },
  { value: "newest", label: "Newest" },
];

export function SortSelect({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (next: SortValue) => void;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <details ref={detailsRef} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 [&::-webkit-details-marker]:hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        {current.label}
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              onChange(o.value);
              if (detailsRef.current) detailsRef.current.open = false;
            }}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
              o.value === value
                ? "bg-blue-600 text-white"
                : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </details>
  );
}
