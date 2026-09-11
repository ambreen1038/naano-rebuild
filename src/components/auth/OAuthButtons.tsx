"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";

type Provider = "linkedin_oidc" | "google";

export function OAuthButtons({
  role,
  mode = "signup",
  showEmailOption = true,
}: {
  // Omitted on the role-agnostic Sign In page: passing "creator" here would
  // make the callback route FORCE-CONVERT an existing brand profile to a
  // creator (see auth/callback/route.ts), which is only safe when we
  // actually know the person is signing up as a creator. Login doesn't
  // know that in advance, so it leaves this unset and lets the callback
  // fall back to the user's real stored role.
  role?: "brand" | "creator";
  mode?: "signup" | "signin";
  showEmailOption?: boolean;
}) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function oauth(provider: Provider) {
    setError(null);
    setPending(provider);
    const supabase = createClient();
    const redirectTo = role
      ? `${window.location.origin}/auth/callback?role=${role}`
      : `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      // Most common cause: the provider isn't enabled in the Supabase
      // dashboard yet (needs a client id/secret configured).
      setError(error.message);
      setPending(null);
    }
  }

  const verb = mode === "signup" ? "Sign up" : "Continue";

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => oauth("linkedin_oidc")}
        disabled={pending !== null}
        className="flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-60"
      >
        {pending === "linkedin_oidc" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LinkedinIcon className="h-4 w-4 text-[#0A66C2]" />
        )}
        {verb} with LinkedIn
      </button>

      <button
        type="button"
        onClick={() => oauth("google")}
        disabled={pending !== null}
        className="flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-60"
      >
        {pending === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="h-4 w-4" />
        )}
        {verb} with Google
      </button>

      {showEmailOption && (
        <Link
          href={mode === "signup" ? `/signup/${role}/email` : "/login"}
          className="flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50"
        >
          <Mail className="h-4 w-4 text-zinc-500" />
          {verb} with email
        </Link>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
