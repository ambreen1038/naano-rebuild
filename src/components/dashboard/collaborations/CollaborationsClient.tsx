"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { UpdateStatusSelect } from "./UpdateStatusSelect";
import { BrandOfferModal, type OfferRow } from "./BrandOfferModal";
import { ViewProfileModal } from "@/components/dashboard/creators/ViewProfileModal";
import { BookingModal } from "@/components/dashboard/creators/BookingModal";
import { NegotiationModal } from "@/components/dashboard/creators/NegotiationModal";
import type { Creator } from "@/components/dashboard/creators/CreatorsClient";
import { respondToApplication } from "@/app/brand/collaborations/actions";

export type BookingRow = {
  id: string;
  status: "invited" | "draft" | "scheduled" | "live" | "completed" | "declined";
  price_agreed: number;
  scheduled_date: string | null;
  created_at: string;
  campaign: { id: string; name: string } | null;
  creator: { id: string; name: string } | null;
  offers: OfferRow[];
};

export type ApplicationRow = {
  id: string;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  created_at: string;
  campaign: { id: string; name: string } | null;
  creator: Creator | null;
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
  invited: {
    label: "Awaiting creator",
    className: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  },
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
  declined: {
    label: "Declined",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
};

const APPLICATION_STATUS_BADGE: Record<
  ApplicationRow["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  },
  declined: {
    label: "Declined",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  },
};

const NEXT_STEP: Record<BookingRow["status"], string> = {
  invited: "Waiting for response",
  draft: "Confirm & schedule",
  scheduled: "Awaiting post",
  live: "Track results",
  completed: "—",
  declined: "—",
};

function tabMatches(tab: (typeof TABS)[number]["value"], status: BookingRow["status"]) {
  if (tab === "all") return true;
  if (tab === "active") return status === "scheduled" || status === "live";
  if (tab === "invitations_sent") return status === "invited" || status === "declined";
  if (tab === "to_do") return status === "draft";
  if (tab === "finished") return status === "completed";
  return false; // invitations_received is rendered from `applications`, not `bookings`
}

export function CollaborationsClient({
  bookings,
  campaigns,
  applications,
}: {
  bookings: BookingRow[];
  campaigns: { id: string; name: string }[];
  applications: ApplicationRow[];
}) {
  const router = useRouter();
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("all");
  const [linesPerPage, setLinesPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [profileCreator, setProfileCreator] = useState<Creator | null>(null);
  const [bookCreator, setBookCreator] = useState<Creator | null>(null);
  const [negotiateCreator, setNegotiateCreator] = useState<Creator | null>(null);
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);
  const [respondingAppId, setRespondingAppId] = useState<string | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const activeBooking = bookings.find((b) => b.id === activeBookingId) ?? null;

  function handleRespondToApplication(
    applicationId: string,
    response: "accepted" | "declined"
  ) {
    setAppError(null);
    setRespondingAppId(applicationId);
    startTransition(async () => {
      const result = await respondToApplication(applicationId, response);
      setRespondingAppId(null);
      if (!result.ok) {
        setAppError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of TABS) {
      if (t.value === "invitations_received") {
        counts[t.value] = applications.filter((a) => a.status === "pending").length;
      } else {
        counts[t.value] = bookings.filter((b) => tabMatches(t.value, b.status)).length;
      }
    }
    return counts;
  }, [bookings, applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((a) => {
      if (
        campaignFilter !== "all" &&
        a.campaign?.id !== campaignFilter
      )
        return false;
      if (
        search &&
        !`${a.creator?.name ?? ""} ${a.campaign?.name ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [applications, campaignFilter, search]);

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

  const showingApplications = tab === "invitations_received";
  const totalPages = Math.max(
    1,
    Math.ceil(
      (showingApplications ? filteredApplications.length : filtered.length) /
        linesPerPage
    )
  );
  const paged = filtered.slice((page - 1) * linesPerPage, page * linesPerPage);
  const pagedApplications = filteredApplications.slice(
    (page - 1) * linesPerPage,
    page * linesPerPage
  );

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

      {appError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {appError}
        </p>
      )}

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

      {showingApplications ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-2 py-3">Campaign</th>
                  <th className="px-2 py-3">Applied on</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-zinc-500">
                      No creator applications yet. These come from creators
                      applying to your campaigns in their Opportunities tab.
                    </td>
                  </tr>
                ) : (
                  pagedApplications.map((a) => {
                    const badge = APPLICATION_STATUS_BADGE[a.status];
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                      >
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                          {a.creator ? (
                            <button
                              type="button"
                              onClick={() => setProfileCreator(a.creator)}
                              className="hover:underline"
                            >
                              {a.creator.name}
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-2 py-3 text-zinc-600 dark:text-zinc-400">
                          {a.campaign?.name ?? "—"}
                        </td>
                        <td className="px-2 py-3 text-zinc-600 dark:text-zinc-400">
                          {new Date(a.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          {a.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={respondingAppId === a.id}
                                onClick={() =>
                                  handleRespondToApplication(a.id, "accepted")
                                }
                                className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={respondingAppId === a.id}
                                onClick={() =>
                                  handleRespondToApplication(a.id, "declined")
                                }
                                className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-400"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
                    const hasOffer = b.status === "invited" || b.offers.length > 0;
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
                          {hasOffer ? (
                            <button
                              type="button"
                              onClick={() => setActiveBookingId(b.id)}
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {b.status === "invited" ? "View offer" : "View history"}
                            </button>
                          ) : (
                            NEXT_STEP[b.status]
                          )}
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
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        <span>
          {showingApplications ? filteredApplications.length : filtered.length}{" "}
          result(s)
        </span>
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

      {activeBooking && (
        <BrandOfferModal
          booking={{
            id: activeBooking.id,
            status: activeBooking.status,
            price_agreed: activeBooking.price_agreed,
            creatorName: activeBooking.creator?.name ?? "This creator",
            campaignName: activeBooking.campaign?.name ?? "Campaign",
          }}
          offers={activeBooking.offers}
          onClose={() => setActiveBookingId(null)}
          onUpdated={() => {
            setActiveBookingId(null);
            router.refresh();
          }}
        />
      )}

      {profileCreator && (
        <ViewProfileModal
          creator={profileCreator}
          onClose={() => setProfileCreator(null)}
          onCollaborate={() => {
            setBookCreator(profileCreator);
            setProfileCreator(null);
          }}
        />
      )}

      {bookCreator && (
        <BookingModal
          creator={bookCreator}
          campaigns={campaigns}
          onClose={() => setBookCreator(null)}
          onNegotiate={() => {
            setNegotiateCreator(bookCreator);
            setBookCreator(null);
          }}
          onSuccess={() => {
            setBookCreator(null);
            setBookSuccess("Invitation sent.");
            router.refresh();
            setTimeout(() => setBookSuccess(null), 3000);
          }}
        />
      )}

      {negotiateCreator && (
        <NegotiationModal
          creator={negotiateCreator}
          campaigns={campaigns}
          onBack={() => {
            setBookCreator(negotiateCreator);
            setNegotiateCreator(null);
          }}
          onClose={() => setNegotiateCreator(null)}
          onSuccess={() => {
            setNegotiateCreator(null);
            setBookSuccess("Offer sent.");
            router.refresh();
            setTimeout(() => setBookSuccess(null), 3000);
          }}
        />
      )}

      {bookSuccess && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            {bookSuccess}
          </div>
        </div>
      )}
    </div>
  );
}
