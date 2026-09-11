# Naano Rebuild

24-hour rebuild of naano.com.

## Live link
TBD

## Repo
TBD

## Setup

1. `npm install`
2. Create a project at [supabase.com](https://supabase.com), then in the SQL editor run, in order:
   - `supabase/migrations/0001_init.sql` (schema, RLS policies, the profile-on-signup trigger)
   - `supabase/seed.sql` (seeded creator marketplace data)
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL, anon key, and service role key (Project Settings → API).
4. `npm run dev`, then open [localhost:3000](http://localhost:3000).

### Schema

- `profiles` — one row per brand/company user (1:1 with `auth.users`), auto-created on signup.
- `creators` — seeded marketplace data (name, vertical, follower count, price/post). Not a login-able role in this MVP.
- `campaigns` — a brand's briefs (objective, key messages, creator guidelines, target vertical, landing URL).
- `bookings` — campaign × creator, the pipeline (`draft` → `scheduled` → `live` → `completed`), plus contract/invoice/payout status.
- `click_events` — real click-through attribution, written server-side by the `/r/[slug]` redirect route.

## Agent logs
All agent prompts and responses are committed in `.agent-logs/`.
