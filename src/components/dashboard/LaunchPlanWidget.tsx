"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Check,
  ChevronDown,
  Handshake,
  Store,
  Sun,
  X,
} from "lucide-react";
import type { LaunchPlanStep } from "@/lib/launch-plan";

const STEP_ICONS: Record<LaunchPlanStep["key"], React.ComponentType<{ className?: string }>> = {
  marketplace: Store,
  brief: Building2,
  booking: Handshake,
};

function StepCard({
  step,
  isActive,
  onNavigate,
}: {
  step: LaunchPlanStep;
  isActive: boolean;
  onNavigate: () => void;
}) {
  const Icon = step.done ? Check : STEP_ICONS[step.key];

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          step.done
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
            : isActive
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {step.title}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">{step.description}</p>
      </div>
      <Link
        href={step.href}
        onClick={onNavigate}
        className={`flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-xs font-semibold ${
          step.done
            ? "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
            : isActive
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
        }`}
      >
        {step.done ? step.doneVerb : step.pendingVerb}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

export function LaunchPlanWidget({
  steps,
  completedCount,
  totalCount,
}: {
  steps: LaunchPlanStep[];
  completedCount: number;
  totalCount: number;
}) {
  const [open, setOpen] = useState(false);
  const allDone = completedCount >= totalCount;
  const nextStep = steps.find((s) => !s.done);
  const activeKey = nextStep?.key;
  const stepsLeft = totalCount - completedCount;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-full border border-zinc-200 py-1.5 pl-3 pr-2 lg:flex dark:border-zinc-800"
      >
        <Sun className="h-4 w-4 shrink-0 text-amber-400" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
            Get started
          </span>
          <span className="block max-w-[120px] truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {allDone ? "Launch plan complete" : nextStep?.title}
          </span>
        </span>
        <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-900">
          {completedCount}/{totalCount}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-950">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Your launch plan
                </p>
                <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  Launch your first creator collaboration
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Three guided actions take you from discovery to your first
                  creator invitation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-900">
                <div
                  className="h-1.5 rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${(completedCount / totalCount) * 100}%`,
                  }}
                />
              </div>
              <span className="shrink-0 text-xs font-medium text-zinc-500">
                {allDone ? "All done" : `${stepsLeft} step${stepsLeft === 1 ? "" : "s"} left`}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {steps.map((step) => (
                <StepCard
                  key={step.key}
                  step={step}
                  isActive={step.key === activeKey}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>

            {/* Decorative only — no real call-scheduling integration exists */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
                T
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Need a hand?
                </p>
                <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Build your first creator plan with Thomas
                </p>
              </div>
              <span className="shrink-0 cursor-not-allowed rounded-full bg-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-500 dark:bg-zinc-800">
                Book a call
              </span>
            </div>

            <p className="mt-4 text-center text-xs text-zinc-400">
              You can close this checklist and resume it at any time.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
