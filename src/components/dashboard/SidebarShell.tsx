"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMobileSidebar } from "./PortalShell";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function NavLinks({
  navItems,
  rootPath,
  expanded,
  onNavigate,
}: {
  navItems: NavItem[];
  rootPath: string;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active =
          href === rootPath ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {expanded && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The one nav rail shared by both portals. Desktop (lg+) keeps the
 * original hover-expand-reflow rail; below that it's hidden entirely and
 * replaced with an off-canvas drawer opened from the Topbar's hamburger
 * button (see PortalShell's useMobileSidebar) — a permanently-visible
 * icon-only rail has no way to open on a touch device, since there's no
 * mouse to hover.
 */
export function SidebarShell({
  header,
  navItems,
  rootPath,
}: {
  header: (expanded: boolean) => React.ReactNode;
  navItems: NavItem[];
  rootPath: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const { open, close } = useMobileSidebar();

  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`hidden shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white transition-[width] duration-200 ease-in-out lg:flex dark:border-zinc-800 dark:bg-zinc-950 ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        {header(expanded)}
        <NavLinks navItems={navItems} rootPath={rootPath} expanded={expanded} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="relative flex w-72 max-w-[85vw] flex-col overflow-hidden bg-white dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-2 dark:border-zinc-800">
              <div className="flex-1">{header(true)}</div>
              <button
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavLinks
              navItems={navItems}
              rootPath={rootPath}
              expanded
              onNavigate={close}
            />
          </aside>
        </div>
      )}
    </>
  );
}
