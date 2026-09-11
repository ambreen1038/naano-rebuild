"use client";

import { useMemo, useState } from "react";

export type CreatorBookingRow = {
  id: string;
  status: "draft" | "scheduled" | "live" | "completed";
  price_agreed: number;
  scheduled_date: string | null;
  campaign: { name: string; brand: { company_name: string | null } | null } | null;
  clicks: number;
};

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "needs_action", label: "Needs action" },
  { value: "applications_sent", label: "Applications sent" },
  { value: "declined", label: "Declined" },
  { value: "completed", label: "Completed" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

const STATUS_BADGE: Record<
  CreatorBookingRow["status"],
  { label: string; className: string }
> = {
  draft: {
    label: "Needs action",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  scheduled: {
    label: "Active",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  live: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  completed: {
    label: "Completed",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  },
};

const NEXT_ACTION: Record<CreatorBookingRow["status"], string> = {
  draft: "Confirm the brief",
  scheduled: "Prepare your post",
  live: "Track results",
  completed: "—",
};

function tabMatches(tab: TabValue, status: CreatorBookingRow["status"]) {
  if (tab === "all") return true;
  if (tab === "active") return status === "scheduled" || status === "live";
  if (tab === "needs_action") return status === "draft";
  if (tab === "completed") return status === "completed";
  // "applications_sent" and "declined": no data source yet — see the page
  // component for why. Genuinely always empty, not a filter bug.
  return false;
}

const LINES_PER_PAGE = 10;

export function CreatorCollaborationsClient({
  bookings,
}: {
  bookings: CreatorBookingRow[];
}) {
  const [tab, setTab] = useState<TabValue>("all");
  const [page, setPage] = useState(1);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of TABS) {
      counts[t.value] = bookings.filter((b) => tabMatches(t.value, b.status)).length;
    }
    return counts;
  }, [bookings]);

  const filtered = useMemo(
    () => bookings.filter((b) => tabMatches(tab, b.status)),
    [bookings, tab]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / LINES_PER_PAGE));
  const paged = filtered.slice((page - 1) * LINES_PER_PAGE, page * LINES_PER_PAGE);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Collaborations
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Every step tells you where you stand, what to do, and what happens if
        you do nothing.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-6 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setTab(t.value);
              setPage(1);
            }}
            className={`flex items-center gap-1.5 pb-3 text-sm font-medium ${
              tab === t.value
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t.label}
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
                tab === t.value
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
              }`}
            >
              {tabCounts[t.value]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500 dark:border-zinc-800">
                <th className="px-5 py-3">Brand</th>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Performance</th>
                <th className="px-5 py-3">Next action</th>
                <th className="px-5 py-3">Due date</th>
                <th className="px-5 py-3">Your net</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-zinc-500">
                    No collaborations yet. Brand invitations and your accepted
                    applications land here.
                  </td>
                </tr>
              ) : (
                paged.map((b) => {
                  const badge = STATUS_BADGE[b.status];
                  const canHaveClicks = b.status === "live" || b.status === "completed";
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                    >
                      <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {b.campaign?.brand?.company_name ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {b.campaign?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {canHaveClicks ? `${b.clicks} clicks` : "—"}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {NEXT_ACTION[b.status]}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {b.scheduled_date
                          ? new Date(b.scheduled_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        €{b.price_agreed}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800">
          <span>{filtered.length} collaborations</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium ${
                  page === p
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
