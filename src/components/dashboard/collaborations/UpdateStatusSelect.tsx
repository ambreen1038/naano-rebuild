"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus } from "@/app/brand/collaborations/actions";
import { ALLOWED_BOOKING_TRANSITIONS, type BookingStatus } from "@/lib/booking-status";

const LABELS: Record<BookingStatus, string> = {
  invited: "Invited",
  draft: "Draft",
  scheduled: "Scheduled",
  live: "Live",
  completed: "Completed",
  declined: "Declined",
};

export function UpdateStatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);

  // Only the current status plus whatever it can legitimately move to —
  // `invited`/`declined` are reached only through the creator's own
  // accept/decline, never from here, so they never appear as a pickable
  // next step.
  const options = [current, ...ALLOWED_BOOKING_TRANSITIONS[current]];

  return (
    <div>
      <select
        value={current}
        disabled={isPending || ALLOWED_BOOKING_TRANSITIONS[current].length === 0}
        onChange={(e) => {
          const next = e.target.value as BookingStatus;
          const previous = current;
          setCurrent(next);
          setError(null);
          startTransition(async () => {
            const result = await updateBookingStatus(bookingId, next);
            if (!result.ok) {
              setCurrent(previous);
              setError(result.error);
            }
          });
        }}
        className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
