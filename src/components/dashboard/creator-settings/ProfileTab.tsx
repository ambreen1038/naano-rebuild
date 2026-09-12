"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { INDUSTRY_TAGS } from "@/lib/industries";
import {
  updateDisplayName,
  refreshLinkedInProfile,
  saveProfileSettings,
} from "@/app/creator/(app)/settings/actions";
import type { CreatorSettingsData } from "./CreatorSettingsClient";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export function ProfileTab({ creator }: { creator: CreatorSettingsData }) {
  const router = useRouter();

  const [name, setName] = useState(creator.name);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState(creator.linkedin_refreshed_at);

  const [linkedinUrl, setLinkedinUrl] = useState(creator.linkedin_url ?? "");
  const [twitterUrl, setTwitterUrl] = useState(creator.twitter_url ?? "");
  const [tags, setTags] = useState<string[]>(creator.industry_tags);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  async function handleSaveName() {
    setSavingName(true);
    setNameError(null);
    setNameSaved(false);
    const fd = new FormData();
    fd.set("name", name);
    const result = await updateDisplayName(fd);
    setSavingName(false);
    if (!result.ok) {
      setNameError(result.error);
      return;
    }
    setNameSaved(true);
    router.refresh();
    setTimeout(() => setNameSaved(false), 2500);
  }

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshError(null);
    const result = await refreshLinkedInProfile();
    setRefreshing(false);
    if (!result.ok) {
      setRefreshError(result.error);
      return;
    }
    setRefreshedAt(new Date().toISOString());
    router.refresh();
  }

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length >= 3
          ? prev
          : [...prev, tag]
    );
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    setProfileError(null);
    setProfileSaved(false);
    const fd = new FormData();
    fd.set("linkedin_url", linkedinUrl);
    fd.set("twitter_url", twitterUrl);
    tags.forEach((t) => fd.append("industry_tags", t));
    const result = await saveProfileSettings(fd);
    setSavingProfile(false);
    if (!result.ok) {
      setProfileError(result.error);
      return;
    }
    setProfileSaved(true);
    router.refresh();
    setTimeout(() => setProfileSaved(false), 2500);
  }

  return (
    <div>
      <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
        Personal profile
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        This name appears on your creator card, messages and collaborations.
      </p>
      <label className="mt-4 flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Display name
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleSaveName}
            disabled={savingName || !name.trim()}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
          >
            {savingName && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {nameSaved ? "Saved" : "Save name"}
          </button>
        </div>
      </label>
      {nameError && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{nameError}</p>
      )}

      <div className="my-6 border-t border-zinc-100 dark:border-zinc-900" />

      <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
        Social links
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Manage your public profile links.
      </p>

      <label className="mt-4 flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        LinkedIn
        <div className="flex items-center gap-2">
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/your-profile"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300"
          >
            {refreshing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Refresh profile
          </button>
        </div>
      </label>
      {refreshError && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{refreshError}</p>
      )}
      <p className="mt-2 text-xs text-zinc-400">
        {refreshedAt
          ? `Profile last updated: ${new Date(refreshedAt).toLocaleString([], {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })} · limited to once a week.`
          : "Never refreshed · limited to once a week."}
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        Pulls your name and photo from LinkedIn if you signed in with it —
        follower counts and post data aren&apos;t available without
        LinkedIn&apos;s partner API, so those stay manually entered.
      </p>

      <details
        open={industriesOpen}
        onToggle={(e) => setIndustriesOpen((e.target as HTMLDetailsElement).open)}
        className="mt-4"
      >
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-blue-600 [&::-webkit-details-marker]:hidden">
          <ChevronDown
            className={`h-4 w-4 transition-transform ${industriesOpen ? "rotate-180" : ""}`}
          />
          Industries · {tags.length > 0 ? tags.join(", ") : "None selected"}
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          {INDUSTRY_TAGS.map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                tags.includes(t)
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              <input
                type="checkbox"
                checked={tags.includes(t)}
                onChange={() => toggleTag(t)}
                className="sr-only"
              />
              {t}
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-zinc-400">Pick up to 3.</p>
      </details>

      <label className="mt-4 flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        X (Twitter)
        <input
          value={twitterUrl}
          onChange={(e) => setTwitterUrl(e.target.value)}
          placeholder="https://x.com/your-account"
          className={inputClass}
        />
      </label>

      {profileError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {profileError}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {profileSaved ? "Saved" : "Save profile settings"}
        </button>
      </div>
    </div>
  );
}
