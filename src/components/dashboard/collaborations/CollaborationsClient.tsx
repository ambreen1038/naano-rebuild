"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { UpdateStatusSelect } from "./UpdateStatusSelect";

export type BookingRow = {
  id: string;
  status: "draft" | "scheduled" | "live" | "completed";
  price_agreed: number;
  scheduled_date: string | null;
  created_at: string;
  campaign: { id: string; name: string } | null;
  creator: { id: string; name: string } | null;
};

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "invitations_received", label: "Invitations received" },
  { value: "invitations_sent", label: "Invitations sent" },
  { value: "to_do", label: "To do" },
  { value: "finished", label: "Finished" },
] as const;

const STATUS_BADGE: Record<
  BookingRow["status"],
  { label: string; className: string }
> = {
  draft: {
    label: "To do",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  live: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  completed: {
    label: "Finished",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  },
};

const NEXT_STEP: Record<BookingRow["status"], string> = {
  draft: "Confirm & schedule",
  scheduled: "Awaiting post",
  live: "Track results",
  completed: "—",
};

function tabMatches(tab: (typeof TABS)[number]["value"], status: BookingRow["status"]) {
  if (tab === "all") return true;
  if (tab === "active") return status === "scheduled" || status === "live";
  if (tab === "to_do") return status === "draft";
  if (tab === "finished") return status === "completed";
  return false; // invitations received/sent: not modeled in this MVP
}

export function CollaborationsClient({
  bookings,
  campaigns,
}: {
  bookings: BookingRow[];
  campaigns: { id: string; name: string }[];
}) {
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const [linesPerPage, setLinesPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of TABS) {
      counts[t.value] = bookings.filter((b) => tabMatches(t.value, b.status)).length;
    }
    return counts;
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (!tabMatches(tab, b.status)) return false;
      if (campaignFilter !== "all" && b.campaign?.id !== campaignFilter)
        return false;
      if (
        search &&
        !`${b.creator?.name ?? ""} ${b.campaign?.name ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [bookings, tab, campaignFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / linesPerPage));
  const paged = filtered.slice((page - 1) * linesPerPage, page * linesPerPage);

  const committed = bookings.reduce((sum, b) => sum + Number(b.price_agreed), 0);
  const toDoCount = bookings.filter((b) => b.status === "draft").length;

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Collaborations
        </h1>
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {bookings.length}
            </span>{" "}
            collaborations
          </span>
          <span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              €{committed}
            </span>{" "}
            committed
          </span>
          <span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {toDoCount}
            </span>{" "}
            to do
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={campaignFilter}
          onChange={(e) => {
            setCampaignFilter(e.target.value);
            setPage(1);
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
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search for creators, campaigns..."
            className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6 border-b border-zinc-200 dark:border-zinc-800">
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
                : "text-zinc-500"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                tab === t.value
                  ? "bg-blue-50 dark:bg-blue-950"
                  : "bg-zinc-100 dark:bg-zinc-900"
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
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" />
                </th>
                <th className="px-2 py-3">Creator</th>
                <th className="px-2 py-3">Campaign</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Next step</th>
                <th className="px-2 py-3">Expiry date</th>
                <th className="px-2 py-3">Amount</th>
                <th className="px-2 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-zinc-500">
                    No collaborations at the moment. Invite a creator from the
                    Marketplace.
                  </td>
                </tr>
              ) : (
                paged.map((b) => {
                  const badge = STATUS_BADGE[b.status];
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-zinc-300"
                        />
                      </td>
                      <td className="px-2 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {b.creator?.name ?? "—"}
                      </td>
                      <td className="px-2 py-3 text-zinc-600 dark:text-zinc-400">
                        {b.campaign?.name ?? "—"}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-zinc-600 dark:text-zinc-400">
                        {NEXT_STEP[b.status]}
                      </td>
                      <td className="px-2 py-3 text-zinc-400">—</td>
                      <td className="px-2 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        €{b.price_agreed}
                      </td>
                      <td className="px-2 py-3">
                        <UpdateStatusSelect bookingId={b.id} status={b.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800">
          <span>{filtered.length} collaboration(s)</span>
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
          <label className="flex items-center gap-2">
            Number of lines per page:
            <select
              value={linesPerPage}
              onChange={(e) => {
                setLinesPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
