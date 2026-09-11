"use client";

import Image from "next/image";
import { SidebarShell } from "./SidebarShell";
import { NAV_ITEMS } from "./nav-items";
import { BrandSwitcher, type BrandOption } from "./brand-switcher/BrandSwitcher";

export function Sidebar({
  brands,
  activeBrandId,
  activeCompanyName,
}: {
  brands: BrandOption[];
  activeBrandId: string;
  activeCompanyName: string;
}) {
  return (
    <SidebarShell
      rootPath="/dashboard"
      navItems={NAV_ITEMS}
      header={(expanded) => (
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
            <BrandSwitcher
              brands={brands}
              activeBrandId={activeBrandId}
              activeCompanyName={activeCompanyName}
            />
          )}
        </div>
      )}
    />
  );
}
