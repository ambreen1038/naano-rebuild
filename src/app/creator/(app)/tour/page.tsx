import Link from "next/link";
import {
  ArrowRight,
  IdCard,
  LayoutGrid,
  MessageCircle,
  Store,
  Users,
  Wallet,
} from "lucide-react";

// A real, static recap — not a fake interactive overlay walkthrough (no
// such system exists here). Every step below is a genuine link to a real
// page, which is what makes this an honest "guided tour" rather than a
// decorative one.
const STEPS = [
  {
    href: "/creator",
    icon: LayoutGrid,
    label: "Overview",
    body: "Your stats, active collaborations and recommended opportunities at a glance.",
  },
  {
    href: "/creator/card",
    icon: IdCard,
    label: "My card",
    body: "Edit the marketplace card brands see — positioning, price and reach.",
  },
  {
    href: "/creator/opportunities",
    icon: Store,
    label: "Opportunities",
    body: "Browse active campaigns matched to your industries and apply.",
  },
  {
    href: "/creator/collaborations",
    icon: Users,
    label: "Collaborations",
    body: "Track invitations, offers and bookings from brands, from invite to completion.",
  },
  {
    href: "/creator/messages",
    icon: MessageCircle,
    label: "Messages",
    body: "Chat directly with a brand about an active collaboration.",
  },
  {
    href: "/creator/earnings",
    icon: Wallet,
    label: "Earnings",
    body: "See what you've earned from your collaborations.",
  },
];

export default function CreatorTourPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Guided tour
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        A quick recap of what each part of your Creator Portal does.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              {i + 1}
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              <s.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-zinc-900 dark:text-zinc-50">
                {s.label}
              </span>
              <span className="block text-sm text-zinc-500">{s.body}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-zinc-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
