import Link from "next/link";
import { createCampaign } from "./actions";

const VERTICALS = [
  { value: "sales-tech", label: "Sales tech" },
  { value: "revops", label: "RevOps" },
  { value: "devtools", label: "Devtools" },
  { value: "product", label: "Product" },
  { value: "hr-tech", label: "HR tech" },
  { value: "fintech", label: "Fintech" },
  { value: "marketing-ops", label: "Marketing ops" },
  { value: "vertical-saas", label: "Vertical SaaS" },
];

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Create a campaign
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        A few details, then it&apos;s live in your marketplace.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form
        action={createCampaign}
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Campaign name
          <input
            name="name"
            required
            placeholder="e.g. SmartML creator brief"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Objective / brief
          <textarea
            name="objective"
            required
            rows={4}
            placeholder="What should creators say, and to whom?"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Target creator vertical
          <select
            name="target_vertical"
            defaultValue="sales-tech"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {VERTICALS.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
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
            placeholder="2000"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Landing URL (optional)
          <input
            type="url"
            name="landing_url"
            placeholder="https://yourproduct.com/signup"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Launch campaign
          </button>
          <Link
            href="/brand/campaigns"
            className="text-sm font-medium text-zinc-500 hover:underline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
