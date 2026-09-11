"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/**
 * The one hover-expand-reflow sidebar mechanism shared by both portals.
 * `header` is a render prop (not a plain node) because the brand header
 * needs to know whether the rail is expanded to show/hide its label text.
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
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`flex shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white transition-[width] duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 ${
        expanded ? "w-64" : "w-16"
      }`}
    >
      {header(expanded)}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === rootPath ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
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
    </aside>
  );
}
