import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { CreatorCardPreview } from "@/components/auth/CreatorCardPreview";

export default function CreatorSignupPage() {
  return (
    <AuthSplitLayout
      rightClassName="bg-gradient-to-br from-blue-50 via-white to-blue-100"
      right={<CreatorCardPreview />}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
        Step 1 of 4
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
        Join Naano
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Get paid to create LinkedIn content for B2B brands you actually use.
      </p>

      <OAuthButtons role="creator" />

      <p className="mt-5 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600">
          Sign in here
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
