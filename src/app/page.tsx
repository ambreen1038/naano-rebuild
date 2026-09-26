import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, Globe, ShieldCheck } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";

const NAV_LINKS = [
  { label: "For companies", href: "#marketplace" },
  { label: "For creators", href: "/signup/creator" },
  { label: "How it works", href: "#how-it-works" },
];

const MARKETPLACE_STATS = [
  {
    value: "Browse by vertical",
    label: "Filter creators by industry, audience size and price per post.",
  },
  {
    value: "Compare audience fit",
    label: "See who reaches your buyers before you book.",
  },
  {
    value: "Book in one place",
    label: "Send a brief, agree a price and track the collaboration.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Find creators your buyers trust",
    body: "Compare audience fit and price per post — then shortlist in minutes.",
  },
  {
    n: "02",
    title: "Build a campaign brief in minutes",
    body: "Objectives, key messages and creator guidelines, with tracking links generated for you.",
  },
  {
    n: "03",
    title: "Manage every collaboration",
    body: "Draft, scheduled, live — every post moves through one pipeline you can actually see.",
  },
  {
    n: "04",
    title: "Track reach, clicks, and leads",
    body: "Connect every post to qualified clicks, engaged companies and attributed pipeline.",
  },
  {
    n: "05",
    title: "Track payouts without the admin",
    body: "Follow contracts, invoices and payout status for every collaboration (simulated in this demo).",
  },
];

const CREATOR_POSTS = [
  {
    name: "Alex Morgan",
    meta: "Sample creator · B2B & AI · 34K followers",
    post: "How we rebuilt our prospecting workflow around a shared AI assistant.",
    impressions: "42.8K",
    clicks: "312",
    leads: "18",
  },
  {
    name: "Sam Rivera",
    meta: "Sample creator · Sales · 12K followers",
    post: "Three questions I ask before I add a lead to any outreach sequence.",
    impressions: "9K",
    clicks: "100",
    leads: "50",
  },
  {
    name: "Jordan Lee",
    meta: "Sample creator · B2B · 40K followers",
    post: "Why most sales teams spend their time on the wrong accounts.",
    impressions: "20K",
    clicks: "350",
    leads: "80",
  },
  {
    name: "Taylor Brooks",
    meta: "Sample creator · Content · 34K followers",
    post: "A simple 30-day content system for a B2B founder.",
    impressions: "100K",
    clicks: "1,600",
    leads: "320",
  },
];

const FAQS = [
  {
    q: "What is CreatorLink?",
    a: "CreatorLink is a portfolio project: a marketplace where brands find creators, run campaigns and track results. It uses sample data and is not a real business.",
  },
  {
    q: "Is this a real product?",
    a: "No. It is an independent project built to show full-stack skills with Next.js and Supabase. It is not affiliated with any company.",
  },
  {
    q: "How are creators matched?",
    a: "The demo ranks creators by industry fit and audience relevance, and can use an AI model (Google Gemini) to suggest matches based on a brand's website.",
  },
  {
    q: "How does per-post pricing work?",
    a: "Each creator sets a flat price per sponsored post, and the price is shown before a booking is made.",
  },
  {
    q: "How does attribution work?",
    a: "Every booking gets its own tracked link. Clicks are recorded on the server and attributed to the creator and campaign.",
  },
  {
    q: "Do payouts and billing work?",
    a: "No. Wallet balances, invoices and payouts are simulated in this demo, and no real payment processor is connected.",
  },
];

// Only the product items link to an anchor on this page; the rest are plain text.
const FOOTER_ANCHORS: Record<string, string> = {
  Features: "#marketplace",
  Pricing: "#pricing",
  FAQs: "#faq",
};

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Pricing", "FAQs"],
  },
  {
    title: "About this project",
    links: ["Portfolio project", "Sample data only", "Not affiliated with any company"],
  },
];

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600">
      {name.charAt(0)}
    </span>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="bg-zinc-900 px-6 py-2 text-center text-xs text-zinc-200">
        Portfolio project with sample data. Not affiliated with any company.
      </div>
      {/* ---------------------------------------------------------------- nav */}
      <header className="sticky top-0 z-30 border-b border-white/40 bg-sky-100/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/creatorlink-mark.svg" unoptimized
              alt="CreatorLink"
              width={30}
              height={23}
              className="object-contain"
            />
            <span className="text-lg font-semibold text-zinc-900">creatorlink</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="#faq"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              Resources
            </a>
          </nav>
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-zinc-600 lg:ml-0">
            <Globe className="h-3.5 w-3.5" />
            EN
          </span>
          <Link
            href="/login"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* -------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(to_bottom,#b9e0f5_0%,#d8eefb_30%,#f2f9fd_70%,#ffffff_100%)] px-6 pb-16 pt-20 text-center">
        {/* Soft cloud layering using CSS gradients. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(38%_30%_at_12%_42%,rgba(255,255,255,0.95)_0%,transparent_70%),radial-gradient(30%_24%_at_32%_18%,rgba(255,255,255,0.85)_0%,transparent_72%),radial-gradient(34%_26%_at_72%_28%,rgba(255,255,255,0.9)_0%,transparent_70%),radial-gradient(28%_22%_at_90%_52%,rgba(255,255,255,0.8)_0%,transparent_72%),radial-gradient(75%_40%_at_50%_92%,rgba(255,255,255,1)_0%,transparent_70%)]"
        />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm">
            <LinkedinIcon className="h-3.5 w-3.5 text-blue-600" />
            Portfolio project · sample data
          </span>
          <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight text-zinc-900 sm:text-6xl">
            A marketplace for
            <br />
            B2B creator campaigns.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
            Find creators who reach your buyers, launch campaigns in days, and
            track the clicks and leads from every post.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Launch a campaign
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              See how CreatorLink works →
            </a>
          </div>
          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Sample data. Not a real business.
          </p>
        </div>

      </section>

      {/* -------------------------------------------------------- marketplace */}
      <section id="marketplace" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-blue-600">
            The CreatorLink creator marketplace
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-zinc-900">
            Find the creators that fit your brand.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-zinc-600">
            Find the right B2B voices, compare their audience fit, and book
            every collaboration from one place.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {MARKETPLACE_STATS.map((s) => (
              <div
                key={s.value}
                className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-sky-50 to-white p-6"
              >
                <p className="text-lg font-semibold text-zinc-900">{s.value}</p>
                <p className="mt-2 text-sm text-zinc-600">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- steps */}
      <section id="how-it-works" className="scroll-mt-20 bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            One platform, from brief to results
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-zinc-900">
            Run creator campaigns from one place.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-zinc-600">
            Find the right voices, launch faster, and connect every post to
            measurable business results.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-zinc-200 bg-white p-6"
              >
                <span className="text-xs font-semibold text-blue-600">
                  {s.n}
                </span>
                <h3 className="mt-3 font-semibold text-zinc-900">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- creator posts */}
      <section className="px-6 py-24">
        <p className="mx-auto mb-6 max-w-6xl text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Sample campaign posts (illustrative data)
        </p>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {CREATOR_POSTS.map((c) => (
            <div
              key={c.name}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <Avatar name={c.name} />
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {c.name}
                  </p>
                  <p className="text-xs text-zinc-500">{c.meta}</p>
                </div>
                <LinkedinIcon className="ml-auto h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-4 text-sm text-zinc-700">{c.post}</p>
              <div className="mt-5 grid grid-cols-3 gap-4 rounded-xl bg-zinc-50 p-4">
                <div>
                  <p className="font-semibold text-zinc-900">
                    {c.impressions}
                  </p>
                  <p className="text-xs text-zinc-500">Impressions</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">{c.clicks}</p>
                  <p className="text-xs text-zinc-500">Clicks</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">{c.leads}</p>
                  <p className="text-xs text-zinc-500">Leads</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ pricing */}
      <section id="pricing" className="scroll-mt-20 bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Get started
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">
            Pricing.
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Start free. Upgrade for extra help.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            This is a demo: no real billing takes place.
          </p>

          <div className="mt-12 grid gap-6 text-left md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Self-serve
              </p>
              <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                Run it yourself.
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                For teams that want the infrastructure to run creator campaigns
                in-house.
              </p>
              <p className="mt-6 text-4xl font-bold text-zinc-900">
                €0
                <span className="text-base font-normal text-zinc-500">
                  {" "}
                  / month
                </span>
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-zinc-700">
                {[
                  "Creator marketplace access",
                  "AI-powered brief creation",
                  "Track clicks, companies and pipeline",
                  "Simulated creator payouts",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-8 block rounded-full bg-zinc-900 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800"
              >
                Start for free
              </Link>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Managed campaigns
              </p>
              <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                Done for you.
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                A concept plan for teams that want a done-for-you service. Not available in this demo.
              </p>
              <p className="mt-6 text-4xl font-bold text-zinc-900">
                Custom quote
              </p>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-zinc-700">
                {[
                  "Campaign strategy and positioning",
                  "Creator sourcing and coordination",
                  "Brief creation and campaign launch",
                  "Reporting and optimisation",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <span className="mt-8 block cursor-default rounded-full border border-zinc-300 py-3 text-center text-sm font-medium text-zinc-900">
                Not available in the demo
              </span>
            </div>
          </div>
          <p className="mt-6 text-xs text-zinc-500">
            Demo pricing only. No real charges are made.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- faq */}
      <section id="faq" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-4xl font-bold tracking-tight text-zinc-900">
            Frequently asked questions.
          </h2>
          <p className="mt-4 text-center text-lg text-zinc-600">
            Everything you need to know before getting started.
          </p>
          <div className="mt-12 divide-y divide-zinc-200 border-y border-zinc-200">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-zinc-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-zinc-500">
            Want to look around?{" "}
            <Link href="/signup" className="font-medium text-zinc-900 underline">
              Explore the demo
            </Link>
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- final cta */}
      <section className="bg-[linear-gradient(to_bottom,#ffffff_0%,#eaf6fd_50%,#cfeafa_100%)] px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Ready to explore?
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">
            See the platform in action.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
            Create a brand or creator account to explore campaigns, collaborations
            and messaging.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Create an account
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/creatorlink-mark.svg" unoptimized
                alt="CreatorLink"
                width={30}
                height={23}
                className="object-contain"
              />
              <span className="text-lg font-semibold text-zinc-900">creatorlink</span>
            </Link>
            <p className="max-w-md text-2xl font-semibold tracking-tight text-zinc-900">
              Creator campaigns, from brief to results.
            </p>
            <p className="text-sm text-zinc-500">
              A portfolio project by Ambreen Habib.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {col.title}
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.links.map((l) =>
                    FOOTER_ANCHORS[l] ? (
                      <li key={l}>
                        <a
                          href={FOOTER_ANCHORS[l]}
                          className="text-sm text-zinc-600 hover:text-zinc-900"
                        >
                          {l}
                        </a>
                      </li>
                    ) : (
                      <li
                        key={l}
                        className="cursor-default text-sm text-zinc-600"
                      >
                        {l}
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-12 border-t border-zinc-200 pt-6 text-xs text-zinc-400">
            Portfolio project by Ambreen Habib. Sample data only. Not affiliated with any company.
          </p>
        </div>
      </footer>
    </div>
  );
}
