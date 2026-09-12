"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CreditCard,
  LayoutGrid,
  LogOut,
  Menu,
  Phone,
  Plug,
  Settings,
  UserPlus,
} from "lucide-react";
import { logout } from "@/app/actions";
import { LaunchPlanWidget } from "@/components/dashboard/LaunchPlanWidget";
import { useMobileSidebar } from "@/components/dashboard/PortalShell";
import { SubmitButton } from "@/components/auth/SubmitButton";
import type { LaunchPlanStatus } from "@/lib/launch-plan";

export function Topbar({
  companyName,
  email,
  walletBalance,
  avatarUrl,
  showGrowthPills = true,
  settingsHref,
  walletHref,
  creatorsHref,
  integrationsHref,
  tourHref,
  launchPlan,
}: {
  companyName: string;
  email: string;
  walletBalance: number;
  avatarUrl?: string | null;
  showGrowthPills?: boolean;
  settingsHref?: string;
  /** Where the wallet balance pill links to (e.g. the Billing tab). Left
   * unlinked if omitted, so callers with no such page keep the old
   * plain-badge look. */
  walletHref?: string;
  /** Only the Brand Portal passes this — enables the "Invite Creators" /
   * "Book a call" / "Integrations" items in the avatar menu, which have no
   * Creator Portal equivalent. */
  creatorsHref?: string;
  /** Only the Creator Portal passes these two — its own "Integrations" /
   * "Guided tour" items, distinct from the Brand Portal's menu. */
  integrationsHref?: string;
  tourHref?: string;
  /** Only the Brand Portal passes this — real completion data for the
   * "Get started" pill + Launch Plan modal. Omitted entirely (not just
   * hidden) for the Creator Portal, which has no such checklist. */
  launchPlan?: LaunchPlanStatus;
}) {
  const initial = companyName.charAt(0).toUpperCase() || "?";
  const { toggle } = useMobileSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={toggle}
        aria-label="Open menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-900"
      >
        <Menu className="h-5 w-5" />
      </button>

      {showGrowthPills && (
        <Link
          href="/brand/settings?tab=Integrations"
          className="hidden items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 sm:flex dark:border-zinc-800 dark:text-zinc-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          NAANO MCP
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          Connect
        </Link>
      )}

      <div className="ml-auto flex items-center gap-2">
        {walletHref ? (
          <Link
            href={walletHref}
            className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <CreditCard className="h-3.5 w-3.5 text-zinc-400" />€
            {walletBalance.toFixed(2)}
          </Link>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
            <CreditCard className="h-3.5 w-3.5 text-zinc-400" />€
            {walletBalance.toFixed(2)}
          </span>
        )}

        {/* Decorative only — no localization implemented */}
        <div className="hidden overflow-hidden rounded-full border border-zinc-200 text-xs font-medium sm:flex dark:border-zinc-800">
          <span className="bg-zinc-900 px-2.5 py-1.5 text-white dark:bg-zinc-50 dark:text-zinc-900">
            EN
          </span>
          <span className="px-2.5 py-1.5 text-zinc-400">FR</span>
        </div>

        {launchPlan && (
          <LaunchPlanWidget
            steps={launchPlan.steps}
            completedCount={launchPlan.completedCount}
            totalCount={launchPlan.totalCount}
          />
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
          <summary
            title={email}
            className="relative flex h-9 w-9 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full bg-zinc-900 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden dark:bg-zinc-50 dark:text-zinc-900"
          >
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
            {creatorsHref && (
              <>
                <Link
                  href={creatorsHref}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Creators
                </Link>
                {/* Decorative only — no real call-scheduling integration exists */}
                <span className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-400 dark:text-zinc-600">
                  <Phone className="h-4 w-4" />
                  Book a call
                </span>
                <Link
                  href="/brand/settings?tab=Integrations"
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                >
                  <Plug className="h-4 w-4" />
                  Integrations
                </Link>
              </>
            )}
            {integrationsHref && (
              <Link
                href={integrationsHref}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <Plug className="h-4 w-4" />
                Integrations
              </Link>
            )}
            {settingsHref && (
              <Link
                href={settingsHref}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            )}
            {tourHref && (
              <Link
                href={tourHref}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                <LayoutGrid className="h-4 w-4" />
                Guided tour
              </Link>
            )}
            <form action={logout} className="mt-1 border-t border-zinc-100 pt-1 dark:border-zinc-900">
              <SubmitButton
                className="w-full justify-start rounded-lg px-2 py-1.5 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                pendingText="Signing out…"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </SubmitButton>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
