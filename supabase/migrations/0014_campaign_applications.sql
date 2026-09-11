-- Real gate before a creator can apply: a one-time professional/billing
-- profile (mirrors "Complete your professional setup"). Nullable/optional
-- until completed; `billing_setup_completed_at` marks the gate as passed.
alter table public.creators
  add column registration_country text,
  add column has_registered_business boolean,
  add column legal_name text,
  add column legal_address text,
  add column billing_setup_completed_at timestamptz;

-- Applications are distinct from bookings: a booking is a brand-managed,
-- already-accepted collaboration (bookings: for all, brand-owned). An
-- application is just the creator expressing interest. A brand later
-- turning an application into a booking is a real next step but out of
-- scope here — nothing reads/writes that conversion yet.
create table public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_id uuid not null references public.creators (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

alter table public.campaign_applications enable row level security;

-- Enforced here, not just in the UI, so a direct API call can't skip the
-- billing gate: the creator's own row must already have it completed.
create policy "campaign_applications: creator can apply for self"
  on public.campaign_applications for insert
  with check (
    exists (
      select 1 from public.creators cr
      where cr.id = creator_id
        and cr.user_id = auth.uid()
        and cr.billing_setup_completed_at is not null
    )
  );

create policy "campaign_applications: creator can view own applications"
  on public.campaign_applications for select
  using (
    exists (
      select 1 from public.creators cr
      where cr.id = creator_id and cr.user_id = auth.uid()
    )
  );

-- Reuses the SECURITY DEFINER function from 0012 (bookings' brand-owns-
-- campaign check is the exact same lookup a brand needs here) rather than
-- duplicating it.
create policy "campaign_applications: brand can view applications on own campaigns"
  on public.campaign_applications for select
  using (public.is_own_campaign_booking(campaign_id));
