"use client";

import { useState } from "react";
import {
  Bot,
  Cable,
  Check,
  ChevronRight,
  Copy,
  Eye,
  ShieldCheck,
  Sparkles,
  SquarePen,
} from "lucide-react";

export type IntegrationsInfo = {
  origin: string;
  siteKey: string;
  installed: boolean;
  recentEvents: {
    id: number;
    event_type: string;
    booking_id: string | null;
    created_at: string;
  }[];
};

const CLIENTS = [
  {
    icon: Sparkles,
    iconClass: "bg-orange-50 text-orange-500 dark:bg-orange-950",
    name: "Claude",
    description: "Use Naano from Claude and Cowork.",
  },
  {
    icon: Bot,
    iconClass: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
    name: "ChatGPT",
    description: "Use Naano from a custom ChatGPT app.",
  },
  {
    icon: Cable,
    iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-950",
    name: "Any MCP client",
    description: "Connect another OAuth-compatible client.",
  },
];

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied (permissions/insecure context) — nothing
      // to recover into; the value is still visible to copy manually.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-zinc-800 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function IntegrationsPanel({ info }: { info: IntegrationsInfo }) {
  const [showEvents, setShowEvents] = useState(false);
  const mcpUrl = `${info.origin}/api/mcp`;

  const snippet = `<script>
  window.naano = window.naano || function () {
    (window.naano.q = window.naano.q || []).push(arguments);
  };
</script>
<script async src="${info.origin}/api/n.js"
        data-site="${info.siteKey}"></script>`;

  const trackSnippet = `naano('track', 'signup', { email });
naano('track', 'purchase', { value: 49, order_id });`;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
        Integrations
      </p>
      <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">
        Use Naano from your AI assistant
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Search creators, build campaigns and manage collaborations from
        Claude, ChatGPT or any compatible MCP client.
      </p>

      <div className="mt-4 overflow-hidden rounded-xl bg-zinc-950 text-zinc-50">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="ml-2 text-xs font-medium text-zinc-400">
              NAANO://MCP
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Online
          </span>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Remote MCP endpoint
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <p className="break-all font-mono text-sm font-semibold text-white">
              {mcpUrl}
            </p>
            <CopyButton value={mcpUrl} label="Copy MCP URL" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Streamable HTTP", "OAuth 2.1", "No API key"].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Choose your client
        </h3>
        <p className="text-xs text-zinc-500">One endpoint, any compatible MCP client.</p>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CLIENTS.map((c) => (
          <div
            key={c.name}
            className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-800"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.iconClass}`}
            >
              <c.icon className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {c.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">{c.description}</p>
            </div>
            <span
              title="Setup guide coming soon"
              className="flex h-7 w-7 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-zinc-200 text-zinc-300 dark:border-zinc-800"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              <Eye className="h-4 w-4 text-blue-500" />
              What it can review
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              Read access
            </span>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5 text-xs text-zinc-500">
            <li>Your active workspace, wallet and campaigns</li>
            <li>Available creators, posts and campaign fit</li>
            <li>Applications, bookings and content status</li>
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              <SquarePen className="h-4 w-4 text-blue-500" />
              Actions it can prepare
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-zinc-500 dark:bg-zinc-900">
              Confirmation required
            </span>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5 text-xs text-zinc-500">
            <li>Draft and launch campaigns</li>
            <li>Invite creators and manage applications</li>
            <li>Review submitted content and campaign status</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-50 px-3.5 py-3 text-xs text-zinc-500 dark:bg-zinc-900">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
        The assistant only sees the active Naano workspace your account can
        access. Naano rechecks identity, workspace permissions, rate limits
        and every write confirmation on the server.
      </div>

      <div className="my-6 border-t border-zinc-100 dark:border-zinc-900" />

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          Pixel Naano
        </h3>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            info.installed
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              info.installed ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {info.installed ? "Active" : "Not installed yet"}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        Track visits and conversions from your creators&apos; posts.
      </p>

      <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Installation instructions
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        Paste this snippet before <code>&lt;/head&gt;</code> on every page of
        your site. Visits attribute themselves; for signups and purchases,
        call <code>naano(&apos;track&apos;, …)</code> in your product only
        after the corresponding action succeeds.{" "}
        {info.installed
          ? "Events are being received."
          : "From the first event received, the status above switches to Active."}
      </p>

      <div className="relative mt-3 rounded-xl bg-zinc-950 p-4">
        <pre className="overflow-x-auto text-xs text-zinc-300">{snippet}</pre>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Then call these only after the corresponding action succeeds:
      </p>
      <div className="relative mt-2 rounded-xl bg-zinc-950 p-4">
        <pre className="overflow-x-auto text-xs text-zinc-300">{trackSnippet}</pre>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <CopyButton value={snippet} label="Copy the snippet" />
        <button
          type="button"
          onClick={() => setShowEvents((v) => !v)}
          className="flex items-center gap-1 rounded-full border border-zinc-200 px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
        >
          See received events
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${showEvents ? "rotate-90" : ""}`}
          />
        </button>
      </div>

      {showEvents && (
        <div className="mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
          {info.recentEvents.length === 0 ? (
            <p className="p-4 text-center text-sm text-zinc-500">
              No events received yet.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {info.recentEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {e.event_type}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {e.booking_id ? "From a creator's post" : "Direct visit"}
                    {" · "}
                    {new Date(e.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm dark:border-zinc-900">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Your site key
          </p>
          <p className="mt-0.5 font-mono text-sm text-zinc-700 dark:text-zinc-300">
            {info.siteKey}
          </p>
        </div>
        <CopyButton value={info.siteKey} label="Copy the key" />
      </div>
      <p className="mt-2 text-xs text-zinc-400">
        Install it once: it covers all your campaigns, past and future. The
        key is already embedded in the snippet above.
      </p>
    </div>
  );
}
