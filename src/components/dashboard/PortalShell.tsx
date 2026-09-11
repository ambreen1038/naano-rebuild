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
  return (
    <div className="flex flex-1">
      {sidebar}
      <div className="flex flex-1 flex-col">
        {topbar}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}
