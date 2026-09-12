"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { respondToInvite, counterOffer } from "@/app/creator/(app)/collaborations/actions";

export type OfferRow = {
  id: string;
  offered_by: "brand" | "creator";
  amount: number;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "countered";
  created_at: string;
};

export type OfferBookingSummary = {
  id: string;
  status: string;
  price_agreed: number;
  brandName: string;
  campaignName: string;
};

const OFFER_STATUS_LABEL: Record<OfferRow["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  countered: "Superseded",
};

export function CreatorOfferModal({
  booking,
  offers,
  onClose,
  onUpdated,
}: {
  booking: OfferBookingSummary;
  offers: OfferRow[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [countering, setCountering] = useState(false);
  const [amount, setAmount] = useState(String(booking.price_agreed));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestPending = [...offers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .find((o) => o.status === "pending");

  const currentAmount = latestPending?.amount ?? booking.price_agreed;
  const isOpen = booking.status === "invited";
  const waitingOnBrand = isOpen && latestPending?.offered_by === "creator";
  const canRespond = isOpen && !waitingOnBrand;

  async function handleRespond(response: "accept" | "decline") {
    setSubmitting(true);
    setError(null);
    const result = await respondToInvite(booking.id, response);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onUpdated();
  }

  async function handleCounter() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a valid offer amount.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await counterOffer(booking.id, value, message.trim() || null);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onUpdated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-900">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {booking.brandName}
            </h2>
            <p className="text-sm text-zinc-500">{booking.campaignName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          <div className="rounded-2xl border border-zinc-200 p-4 text-center dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {isOpen ? "Current offer" : "Final amount"}
            </p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {currentAmount} €
            </p>
          </div>

          {offers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Negotiation history
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {[...offers]
                  .sort(
                    (a, b) =>
                      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  )
                  .map((o) => (
                    <div
                      key={o.id}
                      className="rounded-lg border border-zinc-100 px-3 py-2 text-sm dark:border-zinc-900"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-900 dark:text-zinc-50">
                          {o.offered_by === "brand" ? "Brand" : "You"} offered {o.amount} €
                        </span>
                        <span className="text-xs text-zinc-400">
                          {OFFER_STATUS_LABEL[o.status]}
                        </span>
                      </div>
                      {o.message && (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          &ldquo;{o.message}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {!isOpen && (
            <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-900">
              This invitation is no longer open — status: {booking.status}.
            </p>
          )}

          {waitingOnBrand && (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Waiting on the brand to respond to your counter-offer.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          {canRespond && !countering && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleRespond("decline")}
                className="rounded-full border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300"
              >
                Decline
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => setCountering(true)}
                className="rounded-full border border-blue-200 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
              >
                Counter
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleRespond("accept")}
                className="flex items-center justify-center gap-1.5 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Accept
              </button>
            </div>
          )}

          {canRespond && countering && (
            <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-950 dark:bg-blue-950/30">
              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Your counter-offer
                <div className="flex items-center rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none dark:text-zinc-50"
                  />
                  <span className="text-sm text-zinc-400">€</span>
                </div>
              </label>
              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Message (optional)
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Let the brand know why you're proposing this"
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCountering(false)}
                  className="flex-1 rounded-full border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCounter}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Send counter-offer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
