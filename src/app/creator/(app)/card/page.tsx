import Image from "next/image";
import Link from "next/link";
import { requireCreator } from "@/lib/auth/roles";
import { tagColor } from "@/lib/tag-color";
import { COUNTRIES } from "@/lib/countries";
import { INDUSTRY_TAGS } from "@/lib/industries";
import { updateCreatorCard } from "./actions";

function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

type CreatorCard = {
  name: string;
  headline: string;
  avatar_url: string | null;
  country: string | null;
  follower_count: number;
  price_per_post: number;
  bundle_price: number | null;
  industry_tags: string[];
};

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default async function MyCardPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const { mode, error } = await searchParams;
  const { supabase, user } = await requireCreator();

  const { data: creatorRow } = await supabase
    .from("creators")
    .select(
      "name, headline, avatar_url, country, follower_count, price_per_post, bundle_price, industry_tags"
    )
    .eq("user_id", user.id)
    .single();
  const creator = creatorRow as CreatorCard | null;

  const isEdit = mode === "edit";

  return (
    <div className="p-8">
      <div className="flex justify-end">
        <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
          <Link
            href="/creator/card?mode=edit"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              isEdit
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-400"
            }`}
          >
            Edit
          </Link>
          <Link
            href="/creator/card?mode=preview"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              !isEdit
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-400"
            }`}
          >
            Preview
          </Link>
        </div>
      </div>

      {!creator ? (
        <p className="mt-6 text-sm text-zinc-500">
          Your marketplace card hasn&apos;t been created yet.
        </p>
      ) : isEdit ? (
        <div className="mt-6">
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <form
            action={updateCreatorCard}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Your name
              <input
                name="name"
                required
                defaultValue={creator.name}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Headline
              <textarea
                name="headline"
                rows={2}
                defaultValue={creator.headline}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
              Avatar URL
              <input
                type="url"
                name="avatar_url"
                defaultValue={creator.avatar_url ?? ""}
                placeholder="https://..."
                className={inputClass}
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Followers
                <input
                  type="number"
                  name="follower_count"
                  min={0}
                  required
                  defaultValue={creator.follower_count}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Country
                <select
                  name="country"
                  required
                  defaultValue={creator.country ?? ""}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select a country
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Price per post (€)
                <input
                  type="number"
                  name="price_per_post"
                  min={1}
                  required
                  defaultValue={creator.price_per_post}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                Bundle price (€, optional)
                <input
                  type="number"
                  name="bundle_price"
                  min={0}
                  defaultValue={creator.bundle_price ?? ""}
                  placeholder="None set"
                  className={inputClass}
                />
              </label>
            </div>
            <fieldset>
              <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Industries <span className="font-normal text-zinc-400">(pick up to 3)</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {INDUSTRY_TAGS.map((tag) => (
                  <label
                    key={tag}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700 dark:border-zinc-800 dark:text-zinc-400"
                  >
                    <input
                      type="checkbox"
                      name="industry_tags"
                      value={tag}
                      defaultChecked={creator.industry_tags.includes(tag)}
                      className="sr-only"
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="submit"
              className="mt-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Save changes
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-4 border-b border-zinc-100 p-6 dark:border-zinc-900">
              {creator.avatar_url ? (
                <Image
                  src={creator.avatar_url}
                  alt={creator.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-2xl font-semibold text-zinc-400">
                  {creator.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {creator.name}
                </h1>
                <p className="mt-1 text-sm text-zinc-500">{creator.headline}</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {formatK(creator.follower_count)}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Followers
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              About
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {creator.industry_tags.map((tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${tagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Audience &amp; average metrics
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatK(creator.follower_count)}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Followers
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {creator.country ?? "—"}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Based in
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
              Pricing
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  €{creator.price_per_post}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Price per post
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {creator.bundle_price ? `€${creator.bundle_price}` : "None set"}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Bundle
                </p>
              </div>
            </div>
            {/* This is what a brand sees on your public card — inert here
                since you can't book yourself. */}
            <span className="mt-4 inline-flex cursor-default items-center gap-1.5 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white opacity-90">
              Book a post →
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
