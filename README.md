# Creator Marketplace (Naano rebuild)

A 24-hour rebuild of a B2B LinkedIn creator marketplace, inspired by [naano.com](https://naano.com), built with Next.js and Supabase. **This is an independent portfolio project. It is not affiliated with, or endorsed by, Naano.**

**Live demo:** https://naano-rebuild-final.vercel.app/

## How it was built

This project was built with AI coding agents. The agent prompts and responses are committed in [`.agent-logs/`](.agent-logs/) for transparency.

## What it does

A marketplace where brands find creators and run campaigns, and creators receive and manage collaborations.

**Brand side:** creator search with filters, AI-assisted creator matching, a campaign wizard (objective, key messages, guidelines), a collaboration pipeline (`draft`, `scheduled`, `live`, `completed`), analytics, billing and messages.

**Creator side:** onboarding, a creator card, opportunities, campaign applications and negotiation, collaborations, earnings, analytics, affiliate and community pages, and messages.

**Platform:** real click-tracking through a server-side redirect route (`/r/[slug]`), and real-time messaging.

**Simulated:** there is no real payment processor. Wallet balances, invoices and payouts are simulated, and creator data is seeded for demo purposes.

## Tech stack

| Layer | Tools |
|---|---|
| App | Next.js (App Router, server actions, route handlers), React, TypeScript |
| Styling | Tailwind CSS |
| Database and auth | Supabase (PostgreSQL, Auth, Row Level Security, Realtime) |
| AI | Google Gemini (`@google/genai`) for creator matching and website summaries |
| Hosting | Vercel |

## Database

The schema is defined in 27 SQL migrations under `supabase/migrations/`, including Row Level Security policies across the tables and a Realtime publication for messages. Main tables include profiles, creators, campaigns, bookings (the pipeline), applications, invoices, messages and click events.

## Run it locally

1. `npm install`
2. Create a project at [supabase.com](https://supabase.com). In the SQL editor, run the files in `supabase/migrations/` in order, then `supabase/seed.sql`.
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL, anon key and service role key (Project Settings, then API). The Gemini key is optional.
4. `npm run dev`, then open [localhost:3000](http://localhost:3000).

## Demo account

<!-- Add a demo brand login and a demo creator login here so reviewers can try both sides. -->

## Known limitations

- Payments, invoices and payouts are simulated.
- Creator profiles are seeded demo data.
- No automated tests yet.
