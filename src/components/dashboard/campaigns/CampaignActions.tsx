"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pause, Play, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { setCampaignStatus, deleteCampaign } from "@/app/brand/campaigns/[id]/actions";

type Status = "draft" | "active" | "completed";

export function CampaignActions({
  campaignId,
  status,
}: {
  campaignId: string;
  status: Status;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function changeStatus(next: Status) {
    setError(null);
    startTransition(async () => {
      const result = await setCampaignStatus(campaignId, next);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteCampaign(campaignId);
      if (!result.ok) {
        setError(result.error);
        setConfirmingDelete(false);
      } else {
        router.push("/brand/campaigns");
      }
    });
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/brand/campaigns/${campaignId}/edit`}
          className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>

        {status !== "completed" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => changeStatus(status === "active" ? "draft" : "active")}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300"
          >
            {status === "active" ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {status === "active" ? "Pause" : "Resume"}
          </button>
        )}

        {status !== "completed" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => changeStatus("completed")}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark as completed
          </button>
        )}

        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-red-200 px-3 py-1.5 dark:border-red-900">
            <span className="text-sm text-red-700 dark:text-red-400">Delete this campaign?</span>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-xs font-medium text-zinc-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
