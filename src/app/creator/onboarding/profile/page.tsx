import Image from "next/image";
import { redirect } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { CreatorCardPreview } from "@/components/auth/CreatorCardPreview";
import { requireCreator } from "@/lib/auth/roles";
import { COUNTRIES } from "@/lib/countries";
import { INDUSTRY_TAGS } from "@/lib/industries";
import { saveCreatorProfile } from "../actions";

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500";

export default async function CreatorProfileStepPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { profile, onboarding } = await requireCreator();

  // Can't complete this step before the LinkedIn step has run.
  if (!onboarding?.linkedin_url) {
    redirect("/creator/onboarding/linkedin");
  }

  const name = onboarding.linkedin_name ?? profile?.full_name ?? "";

  return (
    <AuthSplitLayout
      rightClassName="bg-gradient-to-br from-blue-50 via-white to-blue-100"
      right={
        <CreatorCardPreview
          name={name}
          headline={onboarding.linkedin_headline}
          avatarUrl={onboarding.linkedin_avatar_url}
          tags={onboarding.industry_tags}
          followerCount={onboarding.linkedin_follower_count}
          countryCode={onboarding.country?.slice(0, 2)}
        />
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
        Step 3 of 4
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
        Complete your creator card
      </h1>

      <div className="mt-4 flex items-start gap-3">
        {onboarding.linkedin_avatar_url ? (
          <Image
            src={onboarding.linkedin_avatar_url}
            alt={name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-base font-semibold text-zinc-400">
            {(name || "?").charAt(0).toUpperCase()}
          </span>
        )}
        <p className="text-xs leading-relaxed text-zinc-500">
          Imported from{" "}
          <span className="break-all font-medium text-zinc-700">
            {onboarding.linkedin_url}
          </span>
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={saveCreatorProfile} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Your name
          <input
            name="linkedin_name"
            required
            defaultValue={name}
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Your LinkedIn headline
          <textarea
            name="linkedin_headline"
            rows={2}
            defaultValue={onboarding.linkedin_headline ?? ""}
            placeholder="e.g. AI-Powered Full-Stack Developer | React · Next.js"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Followers
          <input
            type="number"
            name="follower_count"
            min={0}
            defaultValue={onboarding.linkedin_follower_count ?? ""}
            placeholder="e.g. 3873"
            className={inputClass}
          />
          <span className="text-xs text-zinc-400">
            LinkedIn only exposes follower counts to approved Marketing
            Partners, so enter yours here — brands see this on your card.
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Your country
          <span className="text-xs text-zinc-500">
            Confirm your country before continuing.
          </span>
          <select
            name="country"
            required
            defaultValue={onboarding.country ?? ""}
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

        <fieldset>
          <legend className="text-sm font-medium text-zinc-700">
            Your industries{" "}
            <span className="font-normal text-zinc-400">(pick up to 3)</span>
          </legend>
          <p className="mt-0.5 text-xs text-zinc-500">
            Choose up to 3 industries to help relevant brands find your card.
          </p>
          <div className="mt-3 flex max-h-44 flex-wrap gap-2 overflow-y-auto">
            {INDUSTRY_TAGS.map((tag) => (
              <label
                key={tag}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700"
              >
                <input
                  type="checkbox"
                  name="industry_tags"
                  value={tag}
                  defaultChecked={onboarding.industry_tags.includes(tag)}
                  className="sr-only"
                />
                {tag}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Continue
        </button>
      </form>
    </AuthSplitLayout>
  );
}
