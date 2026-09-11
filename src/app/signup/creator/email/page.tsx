import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { CreatorCardPreview } from "@/components/auth/CreatorCardPreview";
import { signupCreator } from "@/app/signup/actions";

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500";

export default async function CreatorEmailSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthSplitLayout
      rightClassName="bg-gradient-to-br from-blue-50 via-white to-blue-100"
      right={<CreatorCardPreview />}
    >
      <Link
        href="/signup/creator"
        className="text-sm text-zinc-500 hover:underline"
      >
        ← Back
      </Link>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blue-600">
        Step 1 of 4
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
        Join Naano
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Get paid to create LinkedIn content for B2B brands you actually use.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={signupCreator} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Your name
          <input name="full_name" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Continue
        </button>
      </form>
    </AuthSplitLayout>
  );
}
