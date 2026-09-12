"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ConnectLinkedInButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "linkedin_oidc",
      options: { redirectTo: `${window.location.origin}/creator/integrations` },
    });
    if (error) {
      // Most common cause: the provider isn't enabled in the Supabase
      // dashboard yet (same as the sign-up/sign-in OAuth buttons).
      setError(error.message);
      setPending(false);
    }
    // On success Supabase navigates the browser to LinkedIn's own consent
    // screen — this component doesn't re-render after that.
  }

  return (
    <div className="shrink-0 text-right">
      <button
        type="button"
        onClick={connect}
        disabled={pending}
        className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Connect
      </button>
      {error && (
        <p className="mt-1 max-w-[200px] text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
