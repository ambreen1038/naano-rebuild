"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronDown } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({ companyName }: { companyName: string }) {
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
      <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Image
            src="/naano-logomark.png"
            alt="Naano"
            width={36}
            height={28}
            className="shrink-0 object-contain"
          />
          {expanded && (
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              naano
            </span>
          )}
        </div>
        {expanded && (
          <button
            type="button"
            className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="truncate">{companyName}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </button>
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
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
