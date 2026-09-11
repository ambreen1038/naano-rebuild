import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";

export function AuthSplitLayout({
  children,
  right,
  rightClassName = "bg-blue-600",
}: {
  children: React.ReactNode;
  right: React.ReactNode;
  rightClassName?: string;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <div className="flex w-full flex-col bg-white px-6 py-8 lg:w-1/2 lg:px-14">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link href="/">
            <Image
              src="/naano-logomark.png"
              alt="Naano"
              width={34}
              height={26}
              className="object-contain"
            />
          </Link>
          <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-700">
            <Globe className="h-4 w-4" />
            EN
          </span>
        </div>
        <div className="mx-auto mt-10 w-full max-w-md">{children}</div>
      </div>
      <div
        className={`flex w-full items-center px-8 py-16 lg:w-1/2 lg:px-16 ${rightClassName}`}
      >
        {right}
      </div>
    </div>
  );
}
