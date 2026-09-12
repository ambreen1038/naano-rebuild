"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { createCampaign } from "./actions";
import { VERTICALS, VERTICAL_LABELS } from "@/lib/verticals";

const STEPS = [
  { label: "Basics" },
  { label: "Guidance" },
  { label: "Targeting & budget" },
] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  isDone
                    ? "bg-blue-600 text-white"
                    : isActive
                      ? "border-2 border-blue-600 text-blue-600"
                      : "border border-zinc-300 text-zinc-400 dark:border-zinc-700"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : stepNum}
              </span>
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? "text-blue-600"
                    : isDone
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {stepNum < STEPS.length && (
              <div
                className={`mx-3 mb-5 h-0.5 w-12 sm:w-20 ${
                  isDone ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function NewCampaignWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [keyMessages, setKeyMessages] = useState("");
  const [creatorGuidelines, setCreatorGuidelines] = useState("");
  const [targetVertical, setTargetVertical] = useState<(typeof VERTICALS)[number]>("sales-tech");
  const [budget, setBudget] = useState("");
  const [landingUrl, setLandingUrl] = useState("");

  const [attemptedStep1, setAttemptedStep1] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const step1Valid = name.trim().length > 0 && objective.trim().length > 0;

  function goNextFromStep1() {
    setAttemptedStep1(true);
    if (!step1Valid) return;
    setStep(2);
  }

  function validateStep3(): string | null {
    if (budget.trim()) {
      const n = Number(budget);
      if (!Number.isFinite(n) || n < 0) return "Enter a valid budget.";
    }
    if (landingUrl.trim()) {
      try {
        new URL(landingUrl.trim());
      } catch {
        return "Enter a valid landing page URL.";
      }
    }
    return null;
  }

  async function handleLaunch() {
    const err = validateStep3();
    if (err) {
      setFieldError(err);
      return;
    }
    setFieldError(null);
    setServerError(null);
    setSubmitting(true);

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("objective", objective.trim());
    fd.set("key_messages", keyMessages.trim());
    fd.set("creator_guidelines", creatorGuidelines.trim());
    fd.set("target_vertical", targetVertical);
    fd.set("budget", budget.trim());
    fd.set("landing_url", landingUrl.trim());

    const result = await createCampaign(fd);
    setSubmitting(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(`/brand/campaigns/${result.campaignId}`);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Create a campaign
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        A few details, then it&apos;s live in your marketplace.
      </p>

      <div className="mt-6">
        <StepIndicator current={step} />
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        {step === 1 && (
          <>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Campaign name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. SmartML creator brief"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {attemptedStep1 && !name.trim() && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  Campaign name is required.
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Objective / brief
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={4}
                placeholder="What should creators say, and to whom?"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {attemptedStep1 && !objective.trim() && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  Objective / brief is required.
                </span>
              )}
            </label>

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={goNextFromStep1}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Next
              </button>
              <Link
                href="/brand/campaigns"
                className="text-sm font-medium text-zinc-500 hover:underline"
              >
                Cancel
              </Link>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Key messages{" "}
              <span className="font-normal text-zinc-400">(optional)</span>
              <textarea
                value={keyMessages}
                onChange={(e) => setKeyMessages(e.target.value)}
                rows={3}
                placeholder="The 2-3 points every creator's post should get across"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Creator guidelines{" "}
              <span className="font-normal text-zinc-400">(optional)</span>
              <textarea
                value={creatorGuidelines}
                onChange={(e) => setCreatorGuidelines(e.target.value)}
                rows={3}
                placeholder="Tone, formatting, dos and don'ts for the creator"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Target creator vertical
              <select
                value={targetVertical}
                onChange={(e) =>
                  setTargetVertical(e.target.value as (typeof VERTICALS)[number])
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>
                    {VERTICAL_LABELS[v]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Budget (€, optional)
              <input
                type="number"
                min={0}
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="2000"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Landing URL (optional)
              <input
                type="url"
                value={landingUrl}
                onChange={(e) => setLandingUrl(e.target.value)}
                placeholder="https://yourproduct.com/signup"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </label>

            <div className="mt-2 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {name}
              </p>
              <p className="mt-1 line-clamp-2 text-zinc-500">{objective}</p>
            </div>

            {fieldError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {fieldError}
              </p>
            )}
            {serverError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {serverError}
              </p>
            )}

            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleLaunch}
                disabled={submitting}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Launch campaign
              </button>
              <Link
                href="/brand/campaigns"
                className="text-sm font-medium text-zinc-500 hover:underline"
              >
                Cancel
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
