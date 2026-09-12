"use client";

import { useState } from "react";
import { Check, ClipboardCopy, Share2 } from "lucide-react";

export function CreatorCardShareButtons({
  creatorId,
  creatorName,
}: {
  creatorId: string;
  creatorName: string;
}) {
  const [copied, setCopied] = useState(false);

  function cardUrl() {
    return `${window.location.origin}/c/${creatorId}`;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(cardUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied (permissions/insecure context) — nothing
      // to recover into; the button just won't show the "Copied" state.
    }
  }

  async function share() {
    const url = cardUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${creatorName} on Naano`, url });
      } catch {
        // User dismissed the native share sheet — not an error.
      }
    } else {
      await copy();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <ClipboardCopy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy card link"}
      </button>
      <button
        type="button"
        onClick={share}
        className="flex items-center justify-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share my card
      </button>
    </>
  );
}
