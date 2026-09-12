import { requireCreator } from "@/lib/auth/roles";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";
import { ConnectLinkedInButton } from "@/components/dashboard/creator-settings/ConnectLinkedInButton";

export default async function CreatorIntegrationsPage() {
  const { user } = await requireCreator();
  const connected = user.identities?.some((i) => i.provider === "linkedin_oidc") ?? false;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Integrations
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Connect accounts Naano can use to keep your profile up to date.
      </p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
          <LinkedinIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">LinkedIn</p>
          <p className="text-sm text-zinc-500">
            {connected
              ? "Connected — used to keep your name and photo up to date."
              : "Not connected. Connecting lets Naano pull your name and photo automatically."}
          </p>
        </div>
        {connected ? (
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            Connected
          </span>
        ) : (
          <ConnectLinkedInButton />
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        Naano only ever imports what LinkedIn&apos;s basic sign-in explicitly
        authorizes (your name and profile photo). Follower counts, post
        history and engagement data require LinkedIn&apos;s separate, gated
        Marketing Developer Platform, which isn&apos;t part of this
        integration.
      </p>
    </div>
  );
}
