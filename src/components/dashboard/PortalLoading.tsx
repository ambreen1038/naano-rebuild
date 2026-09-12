export function PortalLoading() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-zinc-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-blue-600 dark:border-zinc-800" />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}
