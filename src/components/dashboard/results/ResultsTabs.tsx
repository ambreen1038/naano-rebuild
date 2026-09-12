import Link from "next/link";

const TABS = [
  { key: "analytics", href: "/brand/analytics", label: "Analytics" },
  { key: "leads", href: "/brand/analytics/leads", label: "Leads" },
  { key: "posts", href: "/brand/analytics/posts", label: "Posts" },
] as const;

export function ResultsTabs({
  active,
}: {
  active: "analytics" | "leads" | "posts";
}) {
  return (
    <div className="mt-4 flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`pb-3 text-sm font-medium ${
            active === t.key
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
