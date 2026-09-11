import Image from "next/image";

export function OpeningCompanyOverlay({ companyName }: { companyName: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-black">
      <Image src="/naano-logomark.png" alt="" width={40} height={31} />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Opening company
        </h1>
        <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">
          {companyName}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Loading your dashboard and campaigns...
        </p>
      </div>
      <div className="mt-2 h-1.5 w-96 max-w-[80vw] overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full w-2/5 animate-pulse rounded-full bg-blue-600" />
      </div>
    </div>
  );
}
