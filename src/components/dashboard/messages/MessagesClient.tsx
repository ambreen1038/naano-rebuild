"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  BarChart3,
  Bug,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  MessageSquarePlus,
  Pencil,
  Search,
  Send,
} from "lucide-react";

type Message = { role: "user" | "bot"; text: string };
type ConversationId = "naanobot";
type ListFilter = "all" | "campaign";

const QUICK_ACTIONS = [
  {
    key: "performance",
    icon: BarChart3,
    title: "Understand my performance",
    subtitle: "Review your analytics",
  },
  {
    key: "help",
    icon: HelpCircle,
    title: "Get product help",
    subtitle: "Get an instant answer",
  },
  {
    key: "bug",
    icon: Bug,
    title: "Report a bug",
    subtitle: "Escalated when needed",
  },
  {
    key: "idea",
    icon: MessageSquarePlus,
    title: "Suggest an idea",
    subtitle: "Share product feedback",
  },
] as const;

function botReplyFor(input: string): string {
  const q = input.toLowerCase();
  if (
    q.includes("performance") ||
    q.includes("analytic") ||
    q.includes("click") ||
    q.includes("result")
  ) {
    return "Your campaign performance lives on the Results tab — Analytics shows qualified clicks and budget committed, Posts shows every live post. Head there anytime, or ask me something specific.";
  }
  if (q.includes("bug") || q.includes("error") || q.includes("broken")) {
    return "Sorry about that — tell me what happened and what you expected instead, and I'll flag it for the team. Escalated automatically if I can't resolve it myself.";
  }
  if (q.includes("idea") || q.includes("feature") || q.includes("suggest")) {
    return "Love it — go ahead and describe the idea. Feedback like this goes straight into our roadmap review.";
  }
  if (q.includes("creator") || q.includes("book")) {
    return 'You can browse and book creators from the Creators tab — filter by industry, country or price, then hit "To book" on any profile.';
  }
  if (q.includes("payment") || q.includes("wallet") || q.includes("invoice")) {
    return "Payments and your wallet balance live under Billing. Let me know if something looks off there and I can take a closer look.";
  }
  return "Thanks for reaching out — I can help with performance questions, product how-tos, bug reports, or feature ideas. Pick one of the options above, or just tell me more.";
}

// The only real conversation today is the NaanoBot assistant thread — there
// is no conversations/messages table in Supabase, so nothing here is a
// stand-in for a richer backend model that already exists. Selecting it is
// real interaction state (not persisted anywhere, same as the rest of this
// feature), which is why a refresh naturally returns to "no conversation
// selected" rather than restoring one.
export function MessagesClient() {
  const [selected, setSelected] = useState<ConversationId | null>(null);
  const [hasOpenedNaanoBot, setHasOpenedNaanoBot] = useState(false);
  const [filter, setFilter] = useState<ListFilter>("all");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi, I'm the Naano assistant. Ask me a question or choose an option above — the team can step in if needed.",
    },
  ]);
  const [input, setInput] = useState("");

  // NaanoBot isn't tied to any campaign, so the "Campaign" filter honestly
  // has nothing to show yet — not a fake empty state, a real one.
  const showNaanoBotRow =
    filter === "all" &&
    (search.trim() === "" ||
      "naanobot".includes(search.trim().toLowerCase()));

  function openNaanoBot() {
    setSelected("naanobot");
    setHasOpenedNaanoBot(true);
  }

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "bot", text: botReplyFor(text) },
    ]);
    setInput("");
  }

  return (
    <div className="flex h-full">
      <div className="flex w-80 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-5 py-5">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Messages
          </h1>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 dark:border-zinc-800"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5">
          <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <Search className="h-4 w-4 shrink-0 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a conversation"
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 px-5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              filter === "all"
                ? "border-zinc-200 bg-white text-blue-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                : "border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            All messages
          </button>
          <button
            type="button"
            onClick={() => setFilter("campaign")}
            className={`flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              filter === "campaign"
                ? "border-zinc-200 bg-white text-blue-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                : "border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            Campaign
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-3 flex-1 overflow-y-auto">
          {showNaanoBotRow && (
            <button
              type="button"
              onClick={openNaanoBot}
              className={`flex w-full items-start gap-3 px-5 py-4 text-left ${
                selected === "naanobot"
                  ? "bg-zinc-50 dark:bg-zinc-900"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              <Image
                src="/naano-logomark.png"
                alt=""
                width={32}
                height={25}
                className="mt-0.5 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    NaanoBot
                  </p>
                  <span className="text-xs text-zinc-400">NOW</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-zinc-500">
                    A question or need help? Click here.
                  </p>
                  {!hasOpenedNaanoBot && (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                      1
                    </span>
                  )}
                </div>
              </div>
            </button>
          )}
          {!showNaanoBotRow && (
            <p className="px-5 py-4 text-sm text-zinc-400">
              No conversation yet.
            </p>
          )}
        </div>
      </div>

      {selected === "naanobot" ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <Image src="/naano-logomark.png" alt="" width={32} height={25} />
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                Naano help center
              </p>
              <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Instant assistant · team when needed
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 to-sky-50 p-6 dark:from-sky-950 dark:to-zinc-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                ✦ Your Naano space
              </p>
              <h2 className="mt-1 max-w-sm text-xl font-bold text-zinc-900 dark:text-zinc-50">
                How can we help?
              </h2>
              <p className="mt-1 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
                Product question, bug or performance concern: everything
                stays here and the team steps in when needed.
              </p>
              <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 sm:block">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/70 shadow-sm">
                  <Image
                    src="/naano-logomark.png"
                    alt=""
                    width={32}
                    height={25}
                  />
                  <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="absolute bottom-1 right-3 h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <p className="mt-2 rounded-full bg-white px-3 py-1 text-center text-xs font-medium text-emerald-700 shadow-sm">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Available now
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => send(a.title)}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    <a.icon className="h-5 w-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {a.title}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {a.subtitle}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-300" />
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {messages.map((m, i) =>
                m.role === "bot" ? (
                  <div key={i} className="flex flex-col items-start gap-1">
                    <div className="max-w-md rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                      {m.text}
                    </div>
                    <span className="ml-1 flex items-center gap-1.5 text-xs text-zinc-400">
                      <Image
                        src="/naano-logomark.png"
                        alt=""
                        width={14}
                        height={11}
                      />
                      Naano
                    </span>
                  </div>
                ) : (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-md rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-sm text-white">
                      {m.text}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Naano a question..."
                className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
              />
              <button
                type="submit"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600">
            <MessageCircle className="h-6 w-6" />
          </span>
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">
            Select a conversation
          </p>
          <p className="max-w-xs text-sm text-zinc-500">
            Choose a conversation from the list on the left to view its
            messages.
          </p>
        </div>
      )}
    </div>
  );
}
