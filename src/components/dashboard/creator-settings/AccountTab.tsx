"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { deleteAccount } from "@/app/creator/(app)/settings/actions";

const CONFIRM_PHRASE = "DELETE";

export function AccountTab() {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setSubmitting(true);
    setError(null);
    const result = await deleteAccount();
    // A successful deletion redirects server-side and never returns here —
    // only the failure path resumes execution.
    setSubmitting(false);
    if (result && !result.ok) {
      setError(result.error);
    }
  }

  return (
    <div>
      <h2 className="font-semibold text-red-600 dark:text-red-400">
        Delete your account
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Permanently delete your creator account and all associated data.
        This cannot be undone.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-800 dark:text-red-300">
            Type <strong>{CONFIRM_PHRASE}</strong> to confirm. Your card,
            bookings history, and settings will be permanently removed.
          </p>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-red-500 dark:border-red-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
          {error && (
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={typed !== CONFIRM_PHRASE || submitting}
              className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Permanently delete
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setTyped("");
                setError(null);
              }}
              className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
