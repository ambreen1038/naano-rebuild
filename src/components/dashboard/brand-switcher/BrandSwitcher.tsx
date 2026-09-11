"use client";

import { useRef, useState, useTransition } from "react";
import { Building2, ChevronDown, Loader2 } from "lucide-react";
import { switchActiveBrand, createBrand } from "./actions";
import { OpeningCompanyOverlay } from "./OpeningCompanyOverlay";

export type BrandOption = { id: string; company_name: string };

export function BrandSwitcher({
  brands,
  activeBrandId,
  activeCompanyName,
}: {
  brands: BrandOption[];
  activeBrandId: string;
  activeCompanyName: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [newName, setNewName] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [openingLabel, setOpeningLabel] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    if (detailsRef.current) detailsRef.current.open = false;
  }

  function handleSwitch(id: string) {
    if (id === activeBrandId) {
      close();
      return;
    }
    const target = brands.find((b) => b.id === id);
    setError(null);
    setSwitchingId(id);
    setOpeningLabel(target?.company_name ?? "your space");
    startTransition(async () => {
      const result = await switchActiveBrand(id);
      // Only reached if the action returned instead of redirecting (i.e. it
      // failed) — a successful switch navigates away before this line runs.
      setSwitchingId(null);
      setOpeningLabel(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      close();
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    const website = newWebsite.trim();
    if (!name || !website) return;
    setError(null);
    setOpeningLabel(name);
    const fd = new FormData();
    fd.set("company_name", name);
    fd.set("website", website);
    startTransition(async () => {
      const result = await createBrand(fd);
      setOpeningLabel(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNewName("");
      setNewWebsite("");
      close();
    });
  }

  if (openingLabel) {
    return <OpeningCompanyOverlay companyName={openingLabel} />;
  }

  return (
    <details ref={detailsRef} className="group relative">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm font-medium text-zinc-700 [&::-webkit-details-marker]:hidden dark:border-zinc-800 dark:text-zinc-300">
        <span className="flex items-center gap-1.5 truncate">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span className="truncate">{activeCompanyName}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
      </summary>

      <div className="absolute left-0 top-full z-30 mt-2 w-64 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              disabled={pending}
              onClick={() => handleSwitch(b.id)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                b.id === activeBrandId
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                {switchingId === b.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Building2 className="h-3.5 w-3.5" />
                )}
              </span>
              <span className="truncate">{b.company_name}</span>
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <form
          onSubmit={handleCreate}
          className="mt-2 flex flex-col gap-1.5 border-t border-zinc-100 pt-2 dark:border-zinc-900"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New space name"
            disabled={pending}
            className="w-full min-w-0 rounded-lg border border-zinc-200 px-2.5 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <input
            type="url"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            placeholder="https://its-website.com"
            disabled={pending}
            className="w-full min-w-0 rounded-lg border border-zinc-200 px-2.5 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={pending || !newName.trim() || !newWebsite.trim()}
            className="w-full rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Create
          </button>
        </form>
      </div>
    </details>
  );
}
