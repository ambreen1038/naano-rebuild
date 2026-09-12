"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { tagColor } from "@/lib/tag-color";
import { COUNTRIES } from "@/lib/countries";
import { INDUSTRY_TAGS } from "@/lib/industries";
import {
  updateProfileDetails,
  toggleSectionVisibility,
} from "@/app/creator/(app)/card/actions";
import { refreshLinkedInProfile } from "@/app/creator/(app)/settings/actions";
import { ChangePhotoModal } from "./ChangePhotoModal";
import { EditPriceBundleModal } from "./EditPriceBundleModal";

function formatK(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

export type CreatorCardData = {
  name: string;
  headline: string;
  about: string | null;
  avatar_url: string | null;
  country: string | null;
  follower_count: number;
  price_per_post: number;
  bundle_price: number | null;
  bundle_post_count: number | null;
  industry_tags: string[];
  about_hidden: boolean;
  metrics_hidden: boolean;
  pricing_hidden: boolean;
  linkedin_url: string | null;
  linkedin_refreshed_at: string | null;
};

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

function SectionVisibilityToggle({
  section,
  hidden,
  onToggled,
}: {
  section: "about" | "metrics" | "pricing";
  hidden: boolean;
  onToggled: () => void;
}) {
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    await toggleSectionVisibility(section, !hidden);
    setPending(false);
    onToggled();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={hidden ? "Hidden from this card preview — click to show" : "Shown on this card preview — click to hide"}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-900"
    >
      {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

export function MyCardClient({
  mode,
  creator,
}: {
  mode: "preview" | "edit";
  creator: CreatorCardData;
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(creator.avatar_url);

  const [name, setName] = useState(creator.name);
  const [headline, setHeadline] = useState(creator.headline);
  const [about, setAbout] = useState(creator.about ?? "");
  const [country, setCountry] = useState(creator.country ?? "");
  const [followerCount, setFollowerCount] = useState(String(creator.follower_count));
  const [tags, setTags] = useState<string[]>(creator.industry_tags);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length >= 3 ? prev : [...prev, tag]
    );
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("headline", headline);
    fd.set("about", about);
    fd.set("country", country);
    fd.set("follower_count", followerCount);
    tags.forEach((t) => fd.append("industry_tags", t));

    const result = await updateProfileDetails(fd);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/creator/card?mode=preview");
  }

  async function handleRefreshLinkedIn() {
    setRefreshing(true);
    setRefreshError(null);
    const result = await refreshLinkedInProfile();
    setRefreshing(false);
    if (!result.ok) {
      setRefreshError(result.error);
      return;
    }
    router.refresh();
  }

  const initial = name.charAt(0).toUpperCase() || "?";

  return (
    <div className="p-8">
      <div className="flex justify-end">
        <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
          <Link
            href="/creator/card?mode=edit"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              isEdit ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "text-zinc-400"
            }`}
          >
            Edit
          </Link>
          <Link
            href="/creator/card?mode=preview"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              !isEdit ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "text-zinc-400"
            }`}
          >
            Preview
          </Link>
        </div>
      </div>

      <div className={`mt-6 grid grid-cols-1 gap-6 ${isEdit ? "lg:grid-cols-[1fr_320px]" : ""}`}>
        <div className="flex flex-col gap-4">
          {/* -------------------------------------------------- identity */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <NextImage
                    src={avatarUrl}
                    alt={name}
                    width={80}
                    height={80}
                    className="h-20 w-20 shrink-0 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-2xl font-semibold text-zinc-400 dark:bg-zinc-900">
                    {initial}
                  </span>
                )}
                <div className="min-w-0">
                  {isEdit ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`${inputClass} text-lg font-bold`}
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {name}
                    </h1>
                  )}
                  {isEdit ? (
                    <textarea
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      rows={2}
                      className={`${inputClass} mt-1.5 w-full`}
                    />
                  ) : (
                    <p className="mt-1 text-sm text-zinc-500">{headline}</p>
                  )}
                  {!isEdit && creator.linkedin_refreshed_at && (
                    <p className="mt-1 text-xs text-zinc-400">
                      · synced{" "}
                      {new Date(creator.linkedin_refreshed_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
              {isEdit ? (
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(true)}
                  className="shrink-0 rounded-full border border-zinc-300 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Change profile photo
                </button>
              ) : (
                <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900">
                  Private Marketplace card
                </span>
              )}
            </div>
            {!creator.metrics_hidden || isEdit ? (
              <div className="border-t border-zinc-100 p-6 dark:border-zinc-900">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatK(Number(followerCount) || creator.follower_count)}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Followers
                </p>
              </div>
            ) : null}
          </div>

          {/* ------------------------------------------------------ about */}
          {(!creator.about_hidden || isEdit) && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isEdit && <GripVertical className="h-4 w-4 text-zinc-300" />}
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">About</h2>
                </div>
                {isEdit && (
                  <SectionVisibilityToggle
                    section="about"
                    hidden={creator.about_hidden}
                    onToggled={() => router.refresh()}
                  />
                )}
              </div>

              {isEdit ? (
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={8}
                  placeholder="Your bio, key projects, education, how brands can reach you…"
                  className={`${inputClass} mt-3 w-full`}
                />
              ) : (
                <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {about || "No bio added yet."}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {(isEdit ? INDUSTRY_TAGS : creator.industry_tags).map((tag) => {
                  const active = tags.includes(tag);
                  if (!isEdit) {
                    return (
                      <span
                        key={tag}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium ${tagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    );
                  }
                  return (
                    <label
                      key={tag}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs ${
                        active
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleTag(tag)}
                        className="sr-only"
                      />
                      {tag}
                    </label>
                  );
                })}
              </div>
              {isEdit && <p className="mt-1.5 text-xs text-zinc-400">Pick up to 3 industries.</p>}
            </div>
          )}

          {/* -------------------------------------------------- metrics */}
          {(!creator.metrics_hidden || isEdit) && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isEdit && <GripVertical className="h-4 w-4 text-zinc-300" />}
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    Audience &amp; average metrics
                  </h2>
                </div>
                {isEdit && (
                  <SectionVisibilityToggle
                    section="metrics"
                    hidden={creator.metrics_hidden}
                    onToggled={() => router.refresh()}
                  />
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  {isEdit ? (
                    <input
                      type="number"
                      min={0}
                      value={followerCount}
                      onChange={(e) => setFollowerCount(e.target.value)}
                      className={`${inputClass} w-full text-xl font-bold`}
                    />
                  ) : (
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      {formatK(creator.follower_count)}
                    </p>
                  )}
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Followers
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  {isEdit ? (
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={`${inputClass} w-full`}
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
                  ) : (
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      {creator.country ?? "—"}
                    </p>
                  )}
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Based in
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------- pricing */}
          {(!creator.pricing_hidden || isEdit) && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isEdit && <GripVertical className="h-4 w-4 text-zinc-300" />}
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Pricing</h2>
                </div>
                {isEdit && (
                  <SectionVisibilityToggle
                    section="pricing"
                    hidden={creator.pricing_hidden}
                    onToggled={() => router.refresh()}
                  />
                )}
              </div>
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
                    {creator.bundle_price && creator.bundle_post_count
                      ? `${creator.bundle_post_count} posts · €${creator.bundle_price}`
                      : "None set"}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Bundle
                  </p>
                </div>
              </div>
              {isEdit ? (
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(true)}
                  className="mt-4 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Edit price &amp; bundles
                </button>
              ) : (
                <span className="mt-4 inline-flex cursor-default items-center gap-1.5 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white opacity-90">
                  Book a post →
                </span>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          {isEdit && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </button>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- sidebar */}
        {isEdit && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  LinkedIn data
                </p>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {creator.linkedin_url ? "Public profile · unverified" : "No LinkedIn profile linked"}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
                Last update
              </p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                {creator.linkedin_refreshed_at
                  ? new Date(creator.linkedin_refreshed_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })
                  : "Never"}
              </p>
              <button
                type="button"
                onClick={handleRefreshLinkedIn}
                disabled={refreshing}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-300 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
              >
                {refreshing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Refresh profile and followers
              </button>
              {refreshError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{refreshError}</p>
              )}
              <p className="mt-2 text-xs text-zinc-400">
                Available once a week. Pulls your name and photo from
                LinkedIn when you signed in with it — not your post
                history or follower count, which need LinkedIn&apos;s
                gated Marketing Developer Platform.
              </p>
            </div>

            {/* Decorative only — no browser extension / verification
                pipeline exists; kept visible rather than a dead link, same
                convention as the Brand Portal's "Book a call". */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-950 dark:bg-blue-950/30">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Become Naano Verified
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Public profile refresh is fine for basic card data. To
                unlock Naano Verified analytics, connect with the Naano
                browser extension.
              </p>
              <span
                title="Not available in this build"
                className="mt-3 flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-blue-300 px-3.5 py-2 text-sm font-semibold text-white opacity-80 dark:bg-blue-900"
              >
                Use the extension
              </span>
            </div>

            <span
              title="Custom sections aren't available in this build"
              className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-full bg-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-500 dark:bg-zinc-900 dark:text-zinc-600"
            >
              <Plus className="h-4 w-4" />
              Add a section
            </span>
          </div>
        )}
      </div>

      {photoModalOpen && (
        <ChangePhotoModal
          currentAvatarUrl={avatarUrl}
          creatorName={name}
          onClose={() => setPhotoModalOpen(false)}
          onSaved={(newUrl) => {
            setAvatarUrl(newUrl);
            setPhotoModalOpen(false);
            router.refresh();
          }}
        />
      )}

      {priceModalOpen && (
        <EditPriceBundleModal
          pricePerPost={creator.price_per_post}
          bundlePrice={creator.bundle_price}
          bundlePostCount={creator.bundle_post_count}
          followerCount={creator.follower_count}
          onClose={() => setPriceModalOpen(false)}
          onSaved={() => {
            setPriceModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
