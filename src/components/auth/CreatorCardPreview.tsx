import Image from "next/image";
import { CalendarClock, Share2 } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";

function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

// The live-updating marketplace card shown beside every creator onboarding
// step. Values are whatever the creator has actually supplied so far — an
// em dash means "not known yet", never an invented number.
export function CreatorCardPreview({
  name,
  headline,
  avatarUrl,
  tags,
  followerCount,
  pricePerPost,
  countryCode,
  hideHeading = false,
  showShareBadge = false,
  showPostDataPill = false,
  costLabel = "Potential cost",
}: {
  name?: string | null;
  headline?: string | null;
  avatarUrl?: string | null;
  tags?: string[];
  followerCount?: number | null;
  pricePerPost?: number | null;
  countryCode?: string | null;
  /** Skip the built-in "Your marketplace card" heading — used when the
   * caller (e.g. the post-onboarding success screen) supplies its own. */
  hideHeading?: boolean;
  /** Small share-icon badge next to the country badge — the Overview tab's
   * mini card shows this, onboarding steps don't. */
  showShareBadge?: boolean;
  /** "No post data available" pill — there's no real post-tracking data
   * source yet, so this is an honest placeholder, not a fake stat. */
  showPostDataPill?: boolean;
  /** Label under the price stat; Overview calls this "Chosen cost" instead
   * of the onboarding default. */
  costLabel?: string;
}) {
  const displayName = name || "Your name";
  const initial = (name || "Y").charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-md text-center">
      {!hideHeading && (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Your marketplace card
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            Build a card brands can trust.
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            It updates live with your profile, analytics, positioning and
            price.
          </p>
        </>
      )}

      <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="relative h-28 bg-gradient-to-r from-blue-700 to-blue-500">
          <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur">
            <LinkedinIcon className="h-5 w-5" />
          </span>
          <div className="absolute right-4 top-4 flex items-center gap-2">
            {countryCode && (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-xs font-semibold uppercase text-white backdrop-blur">
                {countryCode}
              </span>
            )}
            {showShareBadge && (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur">
                <Share2 className="h-4 w-4" />
              </span>
            )}
          </div>
          <div className="flex h-full items-center justify-center gap-2">
            <Image
              src="/naano-logomark.png"
              alt=""
              width={26}
              height={20}
              className="object-contain brightness-0 invert"
            />
            <span className="text-lg font-semibold text-white">naano</span>
          </div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full border-4 border-white object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-zinc-100 text-2xl font-semibold text-zinc-400">
                {initial}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 pt-12">
          <p className="text-xl font-bold text-zinc-900">{displayName}</p>
          {tags && tags.length > 0 && (
            <p className="mt-1 text-sm text-zinc-500">{tags.join(" · ")}</p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            {headline || "Your LinkedIn headline and topics will appear here."}
          </p>

          {showPostDataPill && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <CalendarClock className="h-3.5 w-3.5" />
              No post data available
            </span>
          )}

          <div className="mt-5 flex items-center gap-3 text-xs text-zinc-400">
            <span>Data</span>
            <span className="h-1 flex-1 rounded-full bg-zinc-100" />
            <span>Pending</span>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100">
          <div className="py-4">
            <p className="text-lg font-bold text-zinc-900">
              {followerCount ? formatK(followerCount) : "—"}
            </p>
            <p className="text-xs text-zinc-500">Followers</p>
          </div>
          <div className="py-4">
            <p className="text-lg font-bold text-zinc-900">—</p>
            <p className="text-xs text-zinc-500">Est. impressions</p>
          </div>
          <div className="py-4">
            <p className="text-lg font-bold text-zinc-900">
              {pricePerPost ? `€${pricePerPost}` : "—"}
            </p>
            <p className="text-xs text-zinc-500">
              {pricePerPost ? costLabel : "Cost / post"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
