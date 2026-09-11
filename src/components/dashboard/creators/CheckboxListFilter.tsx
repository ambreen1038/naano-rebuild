"use client";

import { useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export function CheckboxListFilter({
  label,
  icon,
  items,
  selected,
  onChange,
  searchPlaceholder,
}: {
  label: string;
  icon: React.ReactNode;
  items: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchPlaceholder: string;
}) {
  const [query, setQuery] = useState("");
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const filtered = items.filter((i) =>
    i.toLowerCase().includes(query.toLowerCase())
  );

  function toggle(item: string) {
    onChange(
      selected.includes(item)
        ? selected.filter((s) => s !== item)
        : [...selected, item]
    );
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        className={`flex cursor-pointer list-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden ${
          selected.length > 0
            ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
        }`}
      >
        <span className="flex h-4 w-4 items-center justify-center text-zinc-400">
          {icon}
        </span>
        {label}
        {selected.length > 0 && (
          <span className="rounded-full bg-blue-600 px-1.5 text-[11px] text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 top-11 z-20 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 focus-within:border-blue-400 dark:border-zinc-800">
          <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
          />
        </div>
        <div className="mt-2 max-h-64 overflow-y-auto">
          {filtered.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => toggle(item)}
                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              {item}
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-zinc-400">
              No matches
            </p>
          )}
        </div>
      </div>
    </details>
  );
}
