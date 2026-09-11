import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function BrandSignupPage() {
  return (
    <AuthSplitLayout
      right={
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Creators. Brands. Results.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-blue-50">
            Run LinkedIn creator campaigns that drive real business — discover
            creators, track performance, pay in one click.
          </p>
          <p className="mt-8 text-sm text-blue-100">
            Built for B2B marketing teams
          </p>
        </div>
      }
    >
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        Join Naano
      </h1>
      <p className="mt-4 font-semibold text-blue-600">
        Creators. Brands. Results.
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        The #1 platform to run LinkedIn creator campaigns that drive real
        business.
      </p>

      <OAuthButtons role="brand" />

      <p className="mt-5 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600">
          Sign in here
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
