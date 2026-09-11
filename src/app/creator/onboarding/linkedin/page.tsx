import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { CreatorCardPreview } from "@/components/auth/CreatorCardPreview";
import { requireCreator } from "@/lib/auth/roles";
import { importLinkedInProfile } from "../actions";

export default async function LinkedInImportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { profile, onboarding } = await requireCreator();

  return (
    <AuthSplitLayout
      rightClassName="bg-gradient-to-br from-blue-50 via-white to-blue-100"
      right={
        <CreatorCardPreview
          name={onboarding?.linkedin_name ?? profile?.full_name}
          avatarUrl={onboarding?.linkedin_avatar_url}
          headline={onboarding?.linkedin_headline}
        />
      }
    >
      <Link href="/creator" className="text-sm text-zinc-500 hover:underline">
        ← Back to my account
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
        Step 2 of 4
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
        Add your public LinkedIn profile
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        No extension is needed. We&apos;ll retrieve only the minimum public
        information required to create your Basic card.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={importLinkedInProfile} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Public LinkedIn profile URL
          </span>
          <input
            type="url"
            name="linkedin_url"
            required
            defaultValue={onboarding?.linkedin_url ?? ""}
            placeholder="https://www.linkedin.com/in/you"
            className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500"
          />
        </label>

        <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 p-3.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-xs leading-relaxed text-zinc-600">
            By clicking below, you authorize Naano to read your public profile
            once: name, photo, headline, country and follower count. We do not
            import your posts, engagement or private analytics.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-600"
        >
          Import my public profile
        </button>
      </form>
    </AuthSplitLayout>
  );
}
