import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, Globe, ShieldCheck } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/LinkedinIcon";

const NAV_LINKS = [
  { label: "For companies", href: "#marketplace" },
  { label: "For creators", href: "/signup/creator" },
  { label: "For agencies", href: "#case-study" },
  { label: "How it works", href: "#how-it-works" },
];

const LOGOS = ["Abyssale", "BlogSEO", "lemlist", "folk.", "LEADBAY", "ringover"];

const MARKETPLACE_STATS = [
  {
    value: "3,000+ vetted creators",
    label: "Specialist B2B voices, ready to collaborate.",
  },
  {
    value: "Across 100 countries",
    label: "Local expertise with genuinely global reach.",
  },
  {
    value: "Matched to your buyers",
    label: "Audience fit comes before follower count.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Find creators your buyers trust",
    body: "Compare audience fit, verified performance and price per post — then shortlist in minutes.",
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
    title: "Pay creators without the admin",
    body: "Contracts, invoices and payouts handled for you — creators are paid after delivery.",
  },
];

const RESULTS = [
  { value: "5M+", label: "Impressions generated" },
  { value: "30K+", label: "Leads generated" },
  { value: "2,000+", label: "Creators on Naano" },
  { value: "5K+", label: "Posts published" },
];

const CREATOR_POSTS = [
  {
    name: "Thomas Higadère",
    meta: "Creator · B2B & AI · 34K followers",
    post: "How AI changed our prospecting workflow for wealth managers and private bankers.",
    impressions: "42.8K",
    clicks: "312",
    leads: "18",
  },
  {
    name: "Robin Tempe",
    meta: "Creator · Sales & AI · 12K followers",
    post: "I run my entire prospecting workflow through an AI. Here is how.",
    impressions: "9K",
    clicks: "100",
    leads: "50",
  },
  {
    name: "Eric Djavid",
    meta: "Sales Leader · B2B · 40K followers",
    post: "Most sales teams spend 80% of their time on the wrong leads. Here is how I changed that.",
    impressions: "20K",
    clicks: "350",
    leads: "80",
  },
  {
    name: "Marina Panova",
    meta: "Content Creator · B2B · 34K followers",
    post: "How I build my 30-day LinkedIn content system, the exact playbook.",
    impressions: "100K",
    clicks: "1,600",
    leads: "320",
  },
];

const FAQS = [
  {
    q: "What is Naano?",
    a: "Naano is a B2B LinkedIn creator marketplace: companies discover and book vetted creators for sponsored LinkedIn campaigns, each at a fixed price per post set by the creator. The marketplace spans creators from niche voices with around 1,000 followers to established B2B creators with audiences of several hundred thousand.",
  },
  {
    q: "How does Naano find the right creators?",
    a: "Creators are curated by vertical — sales, RevOps, devtools, HR-tech, product, marketing and more — and ranked by audience fit against your buyers first, then refined with verified performance statistics. A creator with 3,000 followers in your exact vertical often outperforms a 100,000-follower generalist.",
  },
  {
    q: "Which networks do you support?",
    a: "LinkedIn is the core of the marketplace, where B2B buying attention actually sits. Some campaigns extend to X (Twitter) when a creator's audience is there too.",
  },
  {
    q: "How does per-post pricing work?",
    a: "Each creator sets a flat fee per sponsored post, starting from around €20 and rising with audience size and vertical scarcity. You see the price before you book — no cost per click, no impression-based billing, no retainer.",
  },
  {
    q: "How does attribution work?",
    a: "Every booking gets its own tracked link. When someone clicks through from a creator's post, that click is attributed back to the creator and campaign, so you can see qualified clicks, engaged companies and pipeline per post rather than guessing.",
  },
  {
    q: "Do you handle creator payouts?",
    a: "Yes. Approve content and pay every creator in one click, securely via Stripe Connect — invoices and approvals are handled for you.",
  },
  {
    q: "What's the difference between Free and Done for you?",
    a: "Self-Serve is €0/month: you get the marketplace, brief creation, tracking and payouts, and you run campaigns in-house. Managed means Naano operates your creator channel end to end — sourcing, briefs, launch, reporting and optimisation.",
  },
  {
    q: "Can I upgrade or cancel anytime?",
    a: "Yes. There's no lock-in — campaign spend is separate from the platform, and you can upgrade or cancel whenever you want.",
  },
];

// Only these three footer items have a real destination on this page today
// (the rest — Blog, press mentions, legal pages, resource articles — don't
// exist as pages, so they stay plain, non-interactive text rather than
// links to somewhere that 404s).
const FOOTER_ANCHORS: Record<string, string> = {
  Features: "#marketplace",
  Pricing: "#pricing",
  FAQs: "#faq",
};

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Pricing", "FAQs", "Blog", "Reports & benchmarks", "About"],
  },
  {
    title: "Company",
    links: ["Help Center", "Privacy", "Terms of Sale & Use", "llms.txt", "pricing.md", "Reports & data"],
  },
  {
    title: "Press",
    links: ["Interview Thomas Marcelle, Xymag.tv", "Naano on FounderTrace", "Naano on TechnicalBeep"],
  },
  {
    title: "Resources",
    links: [
      "LinkedIn creator marketplace",
      "Best B2B influencer platforms 2026",
      "B2B influencer marketing cost",
      "Creator-led growth for B2B",
      "How to pay B2B creators",
    ],
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
      {/* ---------------------------------------------------------------- nav */}
      <header className="sticky top-0 z-30 border-b border-white/40 bg-sky-100/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/naano-logomark.png"
              alt="Naano"
              width={30}
              height={23}
              className="object-contain"
            />
            <span className="text-lg font-semibold text-zinc-900">naano</span>
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
        {/* Soft cloud layering — the real site uses licensed cloud
            photography; this is a CSS approximation of the same feel. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background:radial-gradient(38%_30%_at_12%_42%,rgba(255,255,255,0.95)_0%,transparent_70%),radial-gradient(30%_24%_at_32%_18%,rgba(255,255,255,0.85)_0%,transparent_72%),radial-gradient(34%_26%_at_72%_28%,rgba(255,255,255,0.9)_0%,transparent_70%),radial-gradient(28%_22%_at_90%_52%,rgba(255,255,255,0.8)_0%,transparent_72%),radial-gradient(75%_40%_at_50%_92%,rgba(255,255,255,1)_0%,transparent_70%)]"
        />
        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm">
            <LinkedinIcon className="h-3.5 w-3.5 text-blue-600" />
            Where B2B brands work with creators
          </span>
          <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight text-zinc-900 sm:text-6xl">
            The B2B LinkedIn
            <br />
            Creator Marketplace.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-600">
            Find the creators your buyers already trust, launch campaigns in
            days, and track the clicks, leads and pipeline generated by every
            post.
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
              See how Naano works →
            </a>
          </div>
          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trusted by modern B2B teams
          </p>
        </div>

        <div className="relative mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {LOGOS.map((l) => (
            <span
              key={l}
              className="text-lg font-semibold text-zinc-400 grayscale"
            >
              {l}
            </span>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- testimonial */}
      <section className="bg-zinc-50 px-6 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
          Zmirov Communication
        </p>
        <blockquote className="mx-auto mt-8 max-w-3xl text-3xl font-semibold leading-snug tracking-tight text-zinc-900 sm:text-4xl">
          &ldquo;We manage €10M+ of influence budget every year. For B2B, Naano
          simply makes our life easier&rdquo;
        </blockquote>
        <div className="mt-10 flex flex-col items-center gap-2">
          <Avatar name="David Zmirov" />
          <p className="text-sm font-semibold text-zinc-900">David Zmirov</p>
          <p className="text-sm text-zinc-500">CEO, Zmirov Communication</p>
          <p className="text-xs text-zinc-400">Influence agency</p>
        </div>
      </section>

      {/* -------------------------------------------------------- marketplace */}
      <section id="marketplace" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-blue-600">
            The Naano creator marketplace
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-zinc-900">
            Work with all the best creators.
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

      {/* ------------------------------------------------------- case study */}
      <section id="case-study" className="scroll-mt-20 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900">
            Real teams. Measurable pipeline.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-zinc-600">
            See how B2B teams turn creator trust into attributable demand with
            Naano.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 p-8">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Video testimonial
              </span>
              <blockquote className="mt-4 text-xl font-semibold leading-snug text-zinc-900">
                &ldquo;Naano became one of our fastest acquisition channels. We
                know exactly what every creator brings.&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <Avatar name="Vincent Josse" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Vincent Josse
                  </p>
                  <p className="text-sm text-zinc-500">
                    CEO &amp; Founder, BlogSEO
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-8">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Case study
              </span>
              <h3 className="mt-3 text-xl font-semibold text-zinc-900">
                How BlogSEO turned creator content into product signups
              </h3>
              <p className="mt-3 text-sm text-zinc-600">
                BlogSEO briefed SEO &amp; SaaS creators on LinkedIn and X, then
                traced every trial back to the post that drove it, all in
                Naano.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-zinc-100 pt-6">
                <div>
                  <p className="text-2xl font-bold text-zinc-900">9</p>
                  <p className="text-xs text-zinc-500">creators activated</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">2,940</p>
                  <p className="text-xs text-zinc-500">qualified clicks</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">512</p>
                  <p className="text-xs text-zinc-500">trials started</p>
                </div>
              </div>
              <span className="mt-6 inline-block cursor-default text-sm font-semibold text-zinc-900">
                Read case study →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ results */}
      <section className="bg-zinc-900 px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
          The results
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
          Proven across thousands of campaigns.
        </h2>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
          {RESULTS.map((r) => (
            <div key={r.label}>
              <p className="text-4xl font-bold text-white">{r.value}</p>
              <p className="mt-2 text-sm text-zinc-400">{r.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- creator posts */}
      <section className="px-6 py-24">
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
            Start free. Upgrade when you want your time back.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Choose whether you want to run creator campaigns in-house or have
            Naano operate them.
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
                  "Automatic creator payouts",
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
                Get your time back.
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                For teams that want Naano to operate their creator channel end
                to end.
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
                Book a campaign call
              </span>
            </div>
          </div>
          <p className="mt-6 text-xs text-zinc-500">
            Campaign spend is separate. No lock-in. Cancel anytime.
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
            Still have questions?{" "}
            <Link href="/signup" className="font-medium text-zinc-900 underline">
              Talk to our team
            </Link>
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------- final cta */}
      <section className="bg-[linear-gradient(to_bottom,#ffffff_0%,#eaf6fd_50%,#cfeafa_100%)] px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Ready to launch?
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">
            Your next creator campaign starts here.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600">
            Get a clear creator strategy, campaign format and estimated budget
            for your next launch.
          </p>

          <div className="mt-10 rounded-2xl border border-white bg-white/80 p-8 text-left backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Campaign strategy call
            </p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-900">
              30-minute working session
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Leave with a concrete plan for your next creator campaign.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-700">
              {["Creator strategy", "Campaign format", "Budget recommendation"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    {f}
                  </li>
                )
              )}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="cursor-default rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white">
                Book a campaign call
              </span>
              <span className="text-xs text-zinc-500">
                Pick a time on the next page.
              </span>
            </div>
          </div>

          <p className="mt-6 text-sm text-zinc-600">
            Prefer to start yourself?{" "}
            <Link href="/signup" className="font-medium text-zinc-900">
              Start for free →
            </Link>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/naano-logomark.png"
                alt="Naano"
                width={30}
                height={23}
                className="object-contain"
              />
              <span className="text-lg font-semibold text-zinc-900">naano</span>
            </Link>
            <p className="max-w-md text-2xl font-semibold tracking-tight text-zinc-900">
              Turn LinkedIn creators into your best acquisition channel.
            </p>
            <p className="text-sm text-zinc-500">
              Trusted by B2B teams building creator-led acquisition.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
            © 2026 naano. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
