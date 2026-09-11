"use client";

import { useRouter, usePathname } from "next/navigation";

export function CampaignFilterSelect({
  campaigns,
  current,
}: {
  campaigns: { id: string; name: string }[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={current}
      onChange={(e) => {
        const value = e.target.value;
        router.push(value === "all" ? pathname : `${pathname}?campaign=${value}`);
      }}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
    >
      <option value="all">All campaigns</option>
      {campaigns.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
