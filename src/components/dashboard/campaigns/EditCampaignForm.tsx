"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { updateCampaign } from "@/app/brand/campaigns/[id]/actions";
import { VERTICALS, VERTICAL_LABELS } from "@/lib/verticals";

type Campaign = {
  id: string;
  name: string;
  objective: string;
  key_messages: string | null;
  creator_guidelines: string | null;
  target_vertical: string | null;
  budget: number | null;
  landing_url: string | null;
};

export function EditCampaignForm({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const result = await updateCampaign(campaign.id, formData);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/brand/campaigns/${campaign.id}`);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Edit campaign
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Update the brief creators see when they&apos;re booked or invited.
      </p>

      <form
        action={handleSubmit}
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Campaign name
          <input
            name="name"
            required
            defaultValue={campaign.name}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Objective / brief
          <textarea
            name="objective"
            required
            rows={4}
            defaultValue={campaign.objective}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Key messages <span className="font-normal text-zinc-400">(optional)</span>
          <textarea
            name="key_messages"
            rows={3}
            defaultValue={campaign.key_messages ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Creator guidelines <span className="font-normal text-zinc-400">(optional)</span>
          <textarea
            name="creator_guidelines"
            rows={3}
            defaultValue={campaign.creator_guidelines ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Target creator vertical
          <select
            name="target_vertical"
            defaultValue={campaign.target_vertical ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="">Any</option>
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
            name="budget"
            min={0}
            step="0.01"
            defaultValue={campaign.budget ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Landing URL (optional)
          <input
            type="url"
            name="landing_url"
            defaultValue={campaign.landing_url ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
          <Link
            href={`/brand/campaigns/${campaign.id}`}
            className="text-sm font-medium text-zinc-500 hover:underline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
