"use client";

import Image from "next/image";
import { SidebarShell } from "./SidebarShell";
import { CREATOR_NAV_ITEMS } from "./creator-nav-items";

export function CreatorSidebar() {
  return (
    <SidebarShell
      rootPath="/creator"
      navItems={CREATOR_NAV_ITEMS}
      header={(expanded) => (
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
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
      )}
    />
  );
}
