"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/app/brand/collaborations/actions";

export function UpdateStatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          updateBookingStatus(bookingId, e.target.value);
        })
      }
      className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
    >
      <option value="invited">Invited</option>
      <option value="draft">Draft</option>
      <option value="scheduled">Scheduled</option>
      <option value="live">Live</option>
      <option value="completed">Completed</option>
      <option value="declined">Declined</option>
    </select>
  );
}
