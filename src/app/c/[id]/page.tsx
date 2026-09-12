import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { CreatorCardPreview } from "@/components/auth/CreatorCardPreview";

// Public, unauthenticated — this is the page "Copy card link" / "Share my
// card" (Creator Portal Overview) actually point to, so it uses the
// service-role client (no session to check RLS against) and selects only
// the columns a creator already shows publicly on their marketplace card,
// same pattern as /r/[slug] and /api/track.
export default async function PublicCreatorCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: creator } = await supabase
    .from("creators")
    .select(
      "user_id, name, headline, avatar_url, country, follower_count, price_per_post, industry_tags"
    )
    .eq("id", id)
    .single();

  // Only real, onboarded creators (user_id set) have a shareable card —
  // the fictional demo/seed rows and mock creators were never meant to be
  // linked to publicly.
  if (!creator || !creator.user_id) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white px-6 py-16">
      <Link href="/" className="mb-8 text-lg font-semibold text-zinc-900">
        naano
      </Link>
      <CreatorCardPreview
        showPostDataPill
        name={creator.name}
        headline={creator.headline}
        avatarUrl={creator.avatar_url}
        tags={creator.industry_tags}
        followerCount={creator.follower_count}
        pricePerPost={creator.price_per_post}
        countryCode={creator.country?.slice(0, 2)}
      />
      <Link
        href="/signup/brand"
        className="mt-8 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Book {creator.name?.split(" ")[0] || "this creator"} on Naano
      </Link>
    </div>
  );
}
