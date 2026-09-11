-- Naano rebuild — initial schema
-- Brand-portal-first MVP: brands sign up, browse a seeded creator marketplace,
-- build campaign briefs, book creators into a pipeline, and track real
-- click-through attribution. Creators are reference data, not a login-able role.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per brand/company user, 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  company_name text not null,
  website text,
  industry text not null default 'other'
    check (industry in (
      'sales-tech', 'revops', 'devtools', 'product',
      'hr-tech', 'fintech', 'marketing-ops', 'vertical-saas', 'other'
    )),
  logo_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner can select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: owner can insert own row"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row on signup so the app never has to special-case
-- "no profile yet". company_name/industry come from signup metadata when
-- present, with safe fallbacks otherwise.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, company_name, industry)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'company_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'industry', 'other')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- creators: seeded marketplace data. Not a login-able role in this MVP.
-- ---------------------------------------------------------------------------
create table public.creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  headline text not null,
  avatar_url text,
  vertical text not null
    check (vertical in (
      'sales-tech', 'revops', 'devtools', 'product',
      'hr-tech', 'fintech', 'marketing-ops', 'vertical-saas'
    )),
  follower_count integer not null check (follower_count >= 0),
  country text,
  price_per_post numeric(10, 2) not null check (price_per_post >= 0),
  linkedin_url text,
  sample_post_url text,
  created_at timestamptz not null default now()
);

alter table public.creators enable row level security;

-- Browsing the marketplace requires an account, matching the real product
-- (self-serve is free, but you sign up to see it).
create policy "creators: authenticated users can browse"
  on public.creators for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- campaigns: a brand's briefs
-- ---------------------------------------------------------------------------
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  objective text not null,
  key_messages text,
  creator_guidelines text,
  target_vertical text
    check (target_vertical in (
      'sales-tech', 'revops', 'devtools', 'product',
      'hr-tech', 'fintech', 'marketing-ops', 'vertical-saas'
    )),
  budget numeric(10, 2),
  landing_url text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "campaigns: brand can manage own"
  on public.campaigns for all
  using (auth.uid() = brand_id)
  with check (auth.uid() = brand_id);

-- ---------------------------------------------------------------------------
-- bookings: campaign x creator, the pipeline (draft -> scheduled -> live -> completed)
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  creator_id uuid not null references public.creators (id) on delete restrict,
  fit_score integer check (fit_score between 0 and 100),
  price_agreed numeric(10, 2) not null check (price_agreed >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'live', 'completed')),
  tracking_slug text not null unique default encode(gen_random_bytes(5), 'hex'),
  scheduled_date date,
  published_at timestamptz,
  leads_count integer not null default 0 check (leads_count >= 0),
  contract_status text not null default 'pending'
    check (contract_status in ('pending', 'signed')),
  invoice_status text not null default 'pending'
    check (invoice_status in ('pending', 'sent', 'paid')),
  payout_status text not null default 'pending'
    check (payout_status in ('pending', 'scheduled', 'paid')),
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "bookings: brand can manage bookings on own campaigns"
  on public.bookings for all
  using (
    exists (
      select 1 from public.campaigns c
      where c.id = bookings.campaign_id and c.brand_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.campaigns c
      where c.id = bookings.campaign_id and c.brand_id = auth.uid()
    )
  );

create index bookings_campaign_id_idx on public.bookings (campaign_id);
create index bookings_tracking_slug_idx on public.bookings (tracking_slug);

-- ---------------------------------------------------------------------------
-- click_events: real attribution. Written server-side only (service role,
-- via the /r/[slug] redirect route), so no anon/authenticated insert policy —
-- there's nothing for a client to insert directly.
-- ---------------------------------------------------------------------------
create table public.click_events (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text,
  user_agent text
);

alter table public.click_events enable row level security;

create policy "click_events: brand can view clicks on own bookings"
  on public.click_events for select
  using (
    exists (
      select 1
      from public.bookings b
      join public.campaigns c on c.id = b.campaign_id
      where b.id = click_events.booking_id and c.brand_id = auth.uid()
    )
  );

create index click_events_booking_id_idx on public.click_events (booking_id);
