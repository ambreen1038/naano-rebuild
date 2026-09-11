-- Supports the Results tab:
-- - bookings.post_url: the live LinkedIn post URL, once a booking goes live
--   (distinct from creators.sample_post_url, which is a generic example post)
-- - leads: real schema for lead capture. Populating it needs a pixel/webhook
--   on the brand's own site (out of scope for this rebuild), so this table
--   is genuinely empty until that's built — not mock data, just an honest
--   "not implemented yet" state with real RLS already wired.
alter table public.bookings add column post_url text;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  person_name text,
  company_name text,
  commitment text,
  source text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "leads: brand can view leads on own bookings"
  on public.leads for select
  using (
    exists (
      select 1
      from public.bookings b
      join public.campaigns c on c.id = b.campaign_id
      where b.id = leads.booking_id and c.brand_id = auth.uid()
    )
  );

create index leads_booking_id_idx on public.leads (booking_id);
