"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Euro,
  Lock,
  X,
} from "lucide-react";
import { addBudget } from "@/app/dashboard/billing/actions";

const PRESETS = [2500, 5000, 10000, 25000];
const MINIMUM = 500;

export function BillingBalanceCard({
  walletBalance,
}: {
  walletBalance: number;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number>(2500);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const amount = custom ? Number(custom) : selected;

  function openModal(preset: number) {
    setSelected(preset);
    setCustom("");
    setError(null);
    setDone(false);
    setOpen(true);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addBudget(amount);
      if ("error" in result) {
        setError(result.error);
      } else {
        setDone(true);
      }
    });
  }

  return (
    <>
      <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <span className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950">
          <Euro className="h-5 w-5" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Available balance
        </p>
        <p className="mt-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          €{walletBalance.toFixed(2)}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Ready to spend across your campaigns.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openModal(2500)}
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add budget
          </button>
          <button
            type="button"
            onClick={() => openModal(2500)}
            className="rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
          >
            + €2,500
          </button>
          <button
            type="button"
            onClick={() => openModal(10000)}
            className="rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
          >
            + €10,000
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
                <Lock className="h-3.5 w-3.5" />
                Secure payment
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {done ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  €{amount.toLocaleString()} added
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Your new balance is €
                  {(walletBalance + amount).toLocaleString()}.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Add budget
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  One-time deposit to your Naano balance. Use it across all
                  campaigns — no subscription.
                </p>

                <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 dark:bg-zinc-950">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      Suggested to get started
                    </p>
                    <p className="text-xs text-zinc-500">
                      A comfortable starting balance for your first campaign.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Choose an amount
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setSelected(p);
                        setCustom("");
                      }}
                      className={`rounded-lg border px-2 py-2.5 text-sm font-medium ${
                        !custom && selected === p
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                          : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      €{p.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
                  <span className="text-sm text-zinc-400">€</span>
                  <input
                    value={custom}
                    onChange={(e) =>
                      setCustom(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="Custom amount"
                    inputMode="numeric"
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
                  />
                </div>
                <p className="mt-1.5 text-xs text-zinc-400">
                  Minimum €{MINIMUM} · credited right after payment
                </p>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
                  <div>
                    <p className="text-xs text-zinc-500">You will credit</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      €{(amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Current balance</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                      €{walletBalance.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <p className="flex items-start gap-2">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <span>
                      <strong className="text-zinc-900 dark:text-zinc-50">
                        Card payment
                      </strong>{" "}
                      — entered only on Stripe&apos;s secure checkout (PCI
                      DSS).
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <span>
                      <strong className="text-zinc-900 dark:text-zinc-50">
                        No subscription
                      </strong>{" "}
                      — funds stay in your Naano balance until used.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <span>
                      <strong className="text-zinc-900 dark:text-zinc-50">
                        Pay on delivery
                      </strong>{" "}
                      — creators are charged only after the post is delivered.
                    </span>
                  </p>
                </div>

                {error && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  disabled={pending || amount < MINIMUM}
                  onClick={submit}
                  className="mt-4 w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Adding…" : `Add €${(amount || 0).toLocaleString()}`}
                </button>
                <p className="mt-2 flex items-center justify-center gap-1 text-xs text-zinc-400">
                  <Lock className="h-3 w-3" />
                  End-to-end encrypted · powered by Stripe
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
