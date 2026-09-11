import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasswordField } from "@/components/auth/PasswordField";
import { login } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <AuthSplitLayout
      right={
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Welcome back.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-blue-50">
            Sign in to manage your campaigns, creators and payouts, all in
            one place.
          </p>
        </div>
      }
    >
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-zinc-500">Sign in to your account</p>

      {message && (
        <p className="mt-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <OAuthButtons mode="signin" showEmailOption={false} />

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Or continue with email
        </span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <form action={login} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="john@company.com"
            className={`${inputClass} normal-case`}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Password
            </label>
            {/* Not wired up yet — no reset-password flow exists in this
                app today. Kept visible and inert rather than a dead link. */}
            <span
              title="Coming soon"
              className="cursor-not-allowed text-sm font-medium text-blue-600 opacity-60"
            >
              Forgot password?
            </span>
          </div>
          <PasswordField
            id="login-password"
            name="password"
            autoComplete="current-password"
            className={`${inputClass} pr-9`}
          />
        </div>

        <button
          type="submit"
          className="mt-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-blue-600">
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
