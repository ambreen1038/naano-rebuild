import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { signupBrand } from "@/app/signup/actions";

const INDUSTRIES = [
  { value: "sales-tech", label: "Sales tech" },
  { value: "revops", label: "RevOps" },
  { value: "devtools", label: "Devtools" },
  { value: "product", label: "Product" },
  { value: "hr-tech", label: "HR tech" },
  { value: "fintech", label: "Fintech" },
  { value: "marketing-ops", label: "Marketing ops" },
  { value: "vertical-saas", label: "Vertical SaaS" },
  { value: "other", label: "Other" },
];

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500";

export default async function BrandEmailSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
        </div>
      }
    >
      <Link
        href="/signup/brand"
        className="text-sm text-zinc-500 hover:underline"
      >
        ← Back
      </Link>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
        Create your brand account
      </h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form action={signupBrand} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Your name
          <input name="full_name" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Company name
          <input name="company_name" required className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Company website
          <input
            type="url"
            name="website"
            required
            placeholder="https://yourcompany.com"
            className={inputClass}
          />
          <span className="text-xs text-zinc-400">
            We&apos;ll use this to draft your product summary.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Industry
          <select
            name="industry"
            defaultValue="other"
            className={inputClass}
          >
            {INDUSTRIES.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700">
          Work email
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
          Create account
        </button>
      </form>
    </AuthSplitLayout>
  );
}
