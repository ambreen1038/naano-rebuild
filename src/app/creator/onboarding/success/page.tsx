import Link from "next/link";
import { redirect } from "next/navigation";
import { CreatorCardPreview } from "@/components/auth/CreatorCardPreview";
import { requireCreator, onboardingRouteFor } from "@/lib/auth/roles";

export default async function OnboardingSuccessPage() {
  const { supabase, user, onboarding } = await requireCreator();

  // Only reachable once onboarding is actually done — send anyone else back
  // to the step they're on.
  if (!onboarding?.completed_at) {
    redirect(onboardingRouteFor(onboarding) ?? "/creator/onboarding/linkedin");
  }

  const { data: creator } = await supabase
    .from("creators")
    .select(
      "name, headline, avatar_url, country, follower_count, price_per_post, industry_tags"
    )
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-100 px-6 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Here is your Marketplace card
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Tap it to flip it over. You will be able to customize it in the
          profile coming next.
        </p>
      </div>

      <div className="mt-8 w-full max-w-md">
        <CreatorCardPreview
          hideHeading
          name={creator?.name}
          headline={creator?.headline}
          avatarUrl={creator?.avatar_url}
          tags={creator?.industry_tags}
          followerCount={creator?.follower_count}
          pricePerPost={creator?.price_per_post}
          countryCode={creator?.country?.slice(0, 2)}
        />
      </div>

      <Link
        href="/creator"
        className="mt-8 w-full max-w-md rounded-full bg-blue-600 py-3.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
      >
        Continue to my profile
      </Link>
    </div>
  );
}
