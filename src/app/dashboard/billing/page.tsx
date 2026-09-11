import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BillingBalanceCard } from "@/components/dashboard/billing/BillingBalanceCard";

const TABS = [
  { value: "all", label: "All" },
  { value: "top_up", label: "Top-ups" },
  { value: "booking", label: "Bookings" },
] as const;

const EMPTY_MESSAGE: Record<(typeof TABS)[number]["value"], string> = {
  all: "No invoices or entries yet.",
  top_up: "No top-ups yet, your Stripe top-up will create its invoice.",
  booking: "No booking entries yet.",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab =
    tab === "top_up" || tab === "booking" ? tab : ("all" as const);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", user!.id)
    .single();

  let query = supabase
    .from("invoices")
    .select("id, reference, kind, amount, status, created_at")
    .order("created_at", { ascending: false });
  if (activeTab !== "all") query = query.eq("kind", activeTab);
  const { data: invoices } = await query;

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Billing
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your budget, plan and invoices.
          </p>
        </div>
        <Link
          href="/dashboard/messages"
          className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
        >
          <HelpCircle className="h-4 w-4" />
          Need help?
        </Link>
      </div>

      <div className="mt-4">
        <BillingBalanceCard walletBalance={Number(profile?.wallet_balance ?? 0)} />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-5">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Invoices
          </h2>
        </div>
        <div className="flex items-center gap-6 border-b border-zinc-200 px-5 dark:border-zinc-800">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={
                t.value === "all"
                  ? "/dashboard/billing"
                  : `/dashboard/billing?tab=${t.value}`
              }
              className={`pb-3 text-sm font-medium ${
                activeTab === t.value
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500 dark:border-zinc-800">
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Kind</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!invoices || invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-zinc-500">
                  {EMPTY_MESSAGE[activeTab]}
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                >
                  <td className="px-5 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {inv.reference}
                  </td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                    {new Date(inv.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 capitalize text-zinc-600 dark:text-zinc-400">
                    {inv.kind.replace("_", " ")}
                  </td>
                  <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    €{inv.amount}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-400">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
