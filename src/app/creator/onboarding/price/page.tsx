import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { CreatorCardPreview } from "@/components/auth/CreatorCardPreview";
import { requireCreator } from "@/lib/auth/roles";
import { completeOnboarding } from "../actions";

// Naano's marketplace starts at €20/post; this scales with reach at roughly
// €85 per 1,000 followers, which is the creator's starting point, not a
// locked-in figure — they can edit it here or later from their profile.
function recommendPrice(followers: number | null) {
  if (!followers || followers <= 0) return 20;
  return Math.max(20, Math.round(followers * 0.085));
}

export default async function CreatorPriceStepPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { onboarding } = await requireCreator();

  if (!onboarding?.country || onboarding.industry_tags.length === 0) {
    redirect("/creator/onboarding/profile");
  }

  const name = onboarding.linkedin_name ?? "";
  const recommended =
    onboarding.price_per_post ??
    recommendPrice(onboarding.linkedin_follower_count);

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
          pricePerPost={recommended}
          countryCode={onboarding.country?.slice(0, 2)}
        />
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
        Step 4 of 4
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
        <div>
          {onboarding.linkedin_follower_count != null && (
            <p className="text-sm font-semibold text-zinc-900">
              {onboarding.linkedin_follower_count.toLocaleString()}{" "}
              <span className="font-normal text-zinc-500">followers</span>
            </p>
          )}
          <p className="text-xs leading-relaxed text-zinc-500">
            {onboarding.linkedin_headline}
          </p>
        </div>
      </div>

      <Link
        href="/creator/onboarding/profile"
        className="mt-4 inline-block text-sm text-zinc-500 hover:underline"
      >
        ← Edit my industries
      </Link>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={completeOnboarding} className="mt-4">
        <div className="rounded-2xl border border-zinc-200 p-5">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-blue-600">
            Our recommendation
          </p>
          <p className="mt-2 text-center text-sm leading-relaxed text-zinc-600">
            Naano recommends this starting price from the public audience and
            performance information currently available. You can change it now
            or later.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-zinc-50 py-6">
            <span className="text-3xl font-semibold text-zinc-900">€</span>
            <input
              type="number"
              name="price_per_post"
              min={1}
              step="1"
              required
              defaultValue={recommended}
              aria-label="Price per post"
              className="w-32 bg-transparent text-center text-5xl font-bold text-zinc-900 outline-none"
            />
            <span className="text-lg text-zinc-500">/ post</span>
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-zinc-400">
            This is your net price per post. You can change it at any time from
            your Naano profile.
          </p>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create my marketplace profile
        </button>
      </form>
    </AuthSplitLayout>
  );
}
