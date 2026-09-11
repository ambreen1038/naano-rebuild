import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, CreditCard, Settings, Sun } from "lucide-react";
import { logout } from "@/app/actions";

export function Topbar({
  companyName,
  email,
  walletBalance,
  avatarUrl,
  showGrowthPills = true,
  settingsHref,
}: {
  companyName: string;
  email: string;
  walletBalance: number;
  avatarUrl?: string | null;
  showGrowthPills?: boolean;
  settingsHref?: string;
}) {
  const initial = companyName.charAt(0).toUpperCase() || "?";

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Decorative only — not wired to a real MCP connector */}
      {showGrowthPills && (
        <span className="hidden items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 sm:flex dark:border-zinc-800 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          NAANO MCP
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          Connect
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          <CreditCard className="h-3.5 w-3.5 text-zinc-400" />€
          {walletBalance.toFixed(2)}
        </span>

        {/* Decorative only — no localization implemented */}
        <div className="hidden overflow-hidden rounded-full border border-zinc-200 text-xs font-medium sm:flex dark:border-zinc-800">
          <span className="bg-zinc-900 px-2.5 py-1.5 text-white dark:bg-zinc-50 dark:text-zinc-900">
            EN
          </span>
          <span className="px-2.5 py-1.5 text-zinc-400">FR</span>
        </div>

        {/* Decorative only — not wired to real onboarding progress yet */}
        {showGrowthPills && (
          <span className="hidden items-center gap-2 rounded-full border border-zinc-200 py-1.5 pl-3 pr-2 lg:flex dark:border-zinc-800">
            <Sun className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                Get started
              </span>
              <span className="block max-w-[120px] truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Discover the Marketplace
              </span>
            </span>
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900">
              1/3
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </span>
        )}

        {/* Badge count is decorative — no real notifications system yet */}
        <button
          type="button"
          className="relative rounded-full border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            1
          </span>
        </button>

        <details className="relative">
          <summary className="relative flex h-9 w-9 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full bg-zinc-900 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden dark:bg-zinc-50 dark:text-zinc-900">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              initial
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-zinc-950" />
          </summary>
          <div className="absolute right-0 top-11 z-10 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {companyName}
              </p>
              <p className="truncate text-xs text-zinc-500">{email}</p>
            </div>
            {settingsHref && (
              <Link
                href={settingsHref}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            )}
            <form action={logout}>
              <button
                type="submit"
                className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                Log out
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
