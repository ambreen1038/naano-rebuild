import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

const ROLES = [
  {
    href: "/signup/creator",
    title: "I'm a creator",
    body: "Get paid to create LinkedIn content for B2B brands you actually use.",
  },
  {
    href: "/signup/brand",
    title: "I'm a brand",
    body: "Find creators, launch campaigns, and trace real pipeline back to each post.",
  },
];

export default function SignupRolePage() {
  return (
    <AuthSplitLayout
      right={
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            One platform. Two sides.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-blue-50">
            Creators get paid to post. B2B brands get real pipeline. Pick where
            you fit and we&apos;ll set the rest up in a couple of minutes.
          </p>
        </div>
      }
    >
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-zinc-500">First, who are you here as?</p>

      <div className="mt-6 flex flex-col gap-4">
        {ROLES.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="rounded-xl border border-zinc-200 p-5 transition-colors hover:border-blue-400 hover:bg-blue-50/40"
          >
            <p className="font-semibold text-zinc-900">{r.title}</p>
            <p className="mt-1 text-sm text-zinc-500">{r.body}</p>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
