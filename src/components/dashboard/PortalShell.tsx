"use client";

import { createContext, useContext, useState } from "react";

type MobileSidebarState = {
  open: boolean;
  toggle: () => void;
  close: () => void;
};

const MobileSidebarContext = createContext<MobileSidebarState | null>(null);

/** Shared by Topbar (the hamburger button) and SidebarShell (the drawer
 * itself) — they're siblings passed in as already-built elements, so a
 * plain prop can't reach from one to the other; a small context here is
 * simpler than restructuring how callers build `sidebar`/`topbar`. */
export function useMobileSidebar() {
  const ctx = useContext(MobileSidebarContext);
  if (!ctx) {
    throw new Error("useMobileSidebar must be used within PortalShell");
  }
  return ctx;
}

/**
 * The one shell (sidebar + topbar + main background) shared by the Brand
 * and Creator portals, so their page backgrounds can't drift apart into
 * two separately-maintained designs.
 */
export function PortalShell({
  sidebar,
  topbar,
  children,
}: {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <MobileSidebarContext.Provider
      value={{
        open,
        toggle: () => setOpen((v) => !v),
        close: () => setOpen(false),
      }}
    >
      <div className="flex flex-1">
        {sidebar}
        <div className="flex flex-1 flex-col overflow-hidden">
          {topbar}
          <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black">
            {children}
          </main>
        </div>
      </div>
    </MobileSidebarContext.Provider>
  );
}
