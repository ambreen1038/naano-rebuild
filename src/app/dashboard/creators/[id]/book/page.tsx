import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBooking } from "./actions";

export default async function BookCreatorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: creator }, { data: campaigns }] = await Promise.all([
    supabase
      .from("creators")
      .select("id, name, headline, price_per_post")
      .eq("id", id)
      .single(),
    supabase
      .from("campaigns")
      .select("id, name")
      .order("created_at", { ascending: false }),
  ]);

  if (!creator) {
    notFound();
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Create a campaign first
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          You need at least one campaign before you can book {creator.name}.
        </p>
        <Link
          href="/dashboard/campaigns/new"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create a campaign
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Book {creator.name}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{creator.headline}</p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form
        action={createBooking}
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <input type="hidden" name="creator_id" value={creator.id} />
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Campaign
          <select
            name="campaign_id"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Price agreed (€)
          <input
            type="number"
            name="price_agreed"
            min={0}
            step="0.01"
            defaultValue={creator.price_per_post}
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Scheduled date (optional)
          <input
            type="date"
            name="scheduled_date"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Book creator
          </button>
          <Link
            href="/dashboard/creators"
            className="text-sm font-medium text-zinc-500 hover:underline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
