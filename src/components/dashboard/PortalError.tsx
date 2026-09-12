"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Portal error boundary]", error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
        Something went wrong
      </p>
      <p className="max-w-sm text-sm text-zinc-500">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
