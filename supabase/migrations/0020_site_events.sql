-- Backend for Settings -> Integrations' "Pixel Naano" tracking snippet.
-- A brand pastes one script on their own site; it posts real events to the
-- public /api/track route (service-role, same unauthenticated-ingestion
-- pattern already used by /r/[slug] + click_events). No new "site key"
-- column: the key shown to brands is just their own brand id, formatted as
-- `nn_<hex, no dashes>` (see src/lib/site-key.ts) — nothing extra to keep
-- in sync.
--
-- `booking_id` links a pixel event back to the specific creator-post click
-- that brought the visitor there (via the tracking_slug already appended
-- to /r/[slug]'s redirect as ?naano_ref=) — when that resolves and the
-- event is a real conversion (not a bare pageview), /api/track also writes
-- a `leads` row, so this reuses the existing Results-tab lead pipeline
-- instead of building a second, parallel one.
create table public.site_events (
  id bigint generated always as identity primary key,
  brand_id uuid not null references public.brands (id) on delete cascade,
  event_type text not null,
  booking_id uuid references public.bookings (id) on delete set null,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.site_events enable row level security;

create index site_events_brand_id_idx on public.site_events (brand_id, created_at desc);

create policy "site_events: brand can view own"
  on public.site_events for select
  using (public.is_active_brand(brand_id));
