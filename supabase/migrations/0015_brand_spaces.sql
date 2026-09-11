-- Multi-brand / multi-space support: one authenticated user can own or
-- belong to several brand "spaces" and switch between them, with every
-- brand-scoped table (campaigns, bookings, click_events, leads, invoices)
-- following whichever space is currently active — never mixing data
-- between spaces.
--
-- Until now `profiles` WAS the brand: company_name/industry/website/
-- logo_url/wallet_balance lived there, one-to-one with auth.users, and
-- every brand-owned table's `brand_id` was literally the user's own id.
-- That can't express "one user, several brands", so this migration:
--   1. Introduces `brands` (the space) and `brand_members` (who can act as
--      it — a join table so a space could have more than one member later).
--   2. Backfills one `brands` row per existing brand-role profile, reusing
--      the SAME id, so every existing `campaigns.brand_id` /
--      `invoices.brand_id` value stays a valid reference with no rewrite.
--   3. Adds `profiles.active_brand_id` — the one space a user is currently
--      "looking at". Switching it is the only thing that changes what the
--      rest of the Brand Portal sees.
--   4. Moves company_name/industry/website/logo_url/wallet_balance off
--      `profiles` onto `brands` (a brand's identity, not the user's), and
--      drops them from `profiles` once copied — nothing in the app reads
--      them from `profiles` after this migration.

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  industry text check (industry in (
    'sales-tech', 'revops', 'devtools', 'product',
    'hr-tech', 'fintech', 'marketing-ops', 'vertical-saas', 'other'
  )),
  website text,
  logo_url text,
  wallet_balance numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.brands enable row level security;

create table public.brand_members (
  brand_id uuid not null references public.brands (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (brand_id, user_id)
);

alter table public.brand_members enable row level security;

-- --- backfill: one space per existing brand user, same id as their profile
insert into public.brands (id, company_name, industry, website, logo_url, wallet_balance, created_at)
select id, coalesce(company_name, 'My brand'), industry, website, logo_url, wallet_balance, created_at
from public.profiles
where role = 'brand';

insert into public.brand_members (brand_id, user_id, role)
select id, id, 'owner' from public.profiles where role = 'brand';

alter table public.profiles
  add column active_brand_id uuid references public.brands (id) on delete set null;

update public.profiles set active_brand_id = id where role = 'brand';

-- --- membership vs. "currently active" -------------------------------------
-- `is_brand_member`: broad — any space this user belongs to (used to let
-- the switcher list every space, and to validate switch/create requests).
-- `is_active_brand`: narrow — only the ONE space currently selected. This
-- is what campaigns/bookings/click_events/leads/invoices gate on, so
-- switching `active_brand_id` is the single lever that re-scopes the
-- entire Brand Portal with no other query changes needed.
create function public.is_brand_member(p_brand_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.brand_members bm
    where bm.brand_id = p_brand_id and bm.user_id = auth.uid()
  );
$$;

create function public.is_active_brand(p_brand_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active_brand_id = p_brand_id
  );
$$;

create policy "brands: members can view"
  on public.brands for select
  using (public.is_brand_member(id));

create policy "brands: members can update"
  on public.brands for update
  using (public.is_brand_member(id));

create policy "brand_members: user can view their own memberships"
  on public.brand_members for select
  using (user_id = auth.uid());

-- --- repoint campaigns/invoices at brands instead of profiles --------------
alter table public.campaigns drop constraint campaigns_brand_id_fkey;
alter table public.campaigns
  add constraint campaigns_brand_id_fkey
  foreign key (brand_id) references public.brands (id) on delete cascade;

drop policy "campaigns: brand can manage own" on public.campaigns;
create policy "campaigns: brand can manage own"
  on public.campaigns for all
  using (public.is_active_brand(brand_id))
  with check (public.is_active_brand(brand_id));

alter table public.invoices drop constraint invoices_brand_id_fkey;
alter table public.invoices
  add constraint invoices_brand_id_fkey
  foreign key (brand_id) references public.brands (id) on delete cascade;

drop policy "invoices: brand can view own" on public.invoices;
create policy "invoices: brand can view own"
  on public.invoices for select
  using (public.is_active_brand(brand_id));

drop policy "invoices: brand can record own top-ups" on public.invoices;
create policy "invoices: brand can record own top-ups"
  on public.invoices for insert
  with check (public.is_active_brand(brand_id) and kind = 'top_up');

-- bookings' existing policy already delegates to is_own_campaign_booking(),
-- so redefining that one function's body fixes bookings, click_events'
-- (which reuses the same reasoning inline below) and campaign_applications
-- (from migration 0014) all at once.
create or replace function public.is_own_campaign_booking(p_campaign_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.campaigns c
    where c.id = p_campaign_id and public.is_active_brand(c.brand_id)
  );
$$;

drop policy "click_events: brand can view clicks on own bookings" on public.click_events;
create policy "click_events: brand can view clicks on own bookings"
  on public.click_events for select
  using (
    exists (
      select 1
      from public.bookings b
      join public.campaigns c on c.id = b.campaign_id
      where b.id = click_events.booking_id and public.is_active_brand(c.brand_id)
    )
  );

drop policy "leads: brand can view leads on own bookings" on public.leads;
create policy "leads: brand can view leads on own bookings"
  on public.leads for select
  using (
    exists (
      select 1
      from public.bookings b
      join public.campaigns c on c.id = b.campaign_id
      where b.id = leads.booking_id and public.is_active_brand(c.brand_id)
    )
  );

-- --- brand info for creators moves from profiles to brands -----------------
-- brand_has_active_campaign / creator_has_booking_with_brand never actually
-- depended on auth.uid() for the BRAND side (they compare c.brand_id to the
-- id being checked) — only the table these policies live on changes.
drop policy "profiles: creator can view brand name for own bookings" on public.profiles;
drop policy "profiles: authenticated users can view brand info for active campaigns" on public.profiles;

create policy "brands: creator can view brand info for own bookings"
  on public.brands for select
  using (public.creator_has_booking_with_brand(id));

create policy "brands: authenticated users can view brand info for active campaigns"
  on public.brands for select
  using (public.brand_has_active_campaign(id));

-- --- signup: create a brand's first space atomically alongside its profile -
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text := coalesce(new.raw_user_meta_data ->> 'role', 'brand');
  v_brand_id uuid;
begin
  if v_role = 'creator' then
    insert into public.profiles (id, role, full_name)
    values (
      new.id,
      'creator',
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      )
    );

    insert into public.creator_onboarding (user_id, step)
    values (new.id, 2);
  else
    insert into public.brands (company_name, industry)
    values (
      coalesce(new.raw_user_meta_data ->> 'company_name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data ->> 'industry', 'other')
    )
    returning id into v_brand_id;

    insert into public.profiles (id, role, full_name, active_brand_id)
    values (
      new.id,
      'brand',
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      v_brand_id
    );

    insert into public.brand_members (brand_id, user_id, role)
    values (v_brand_id, new.id, 'owner');
  end if;

  return new;
end;
$$;

-- --- create/switch spaces ---------------------------------------------------
create function public.create_brand(p_company_name text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_brand_id uuid;
  v_name text := btrim(coalesce(p_company_name, ''));
begin
  if v_name = '' then
    raise exception 'Space name is required';
  end if;

  insert into public.brands (company_name) values (v_name)
  returning id into v_brand_id;

  insert into public.brand_members (brand_id, user_id, role)
  values (v_brand_id, auth.uid(), 'owner');

  update public.profiles set active_brand_id = v_brand_id where id = auth.uid();

  return v_brand_id;
end;
$$;

grant execute on function public.create_brand(text) to authenticated;

create function public.switch_active_brand(p_brand_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_brand_member(p_brand_id) then
    raise exception 'Not a member of this brand';
  end if;

  update public.profiles set active_brand_id = p_brand_id where id = auth.uid();
end;
$$;

grant execute on function public.switch_active_brand(uuid) to authenticated;

-- --- wallet top-ups now credit the active brand, not the user's profile ----
create or replace function public.add_budget(p_amount numeric)
returns numeric
language plpgsql
security definer set search_path = public
as $$
declare
  v_brand_id uuid;
  v_new_balance numeric;
begin
  if p_amount < 500 then
    raise exception 'Minimum top-up is €500';
  end if;

  select active_brand_id into v_brand_id from public.profiles where id = auth.uid();
  if v_brand_id is null then
    raise exception 'No active brand selected';
  end if;

  update public.brands
  set wallet_balance = wallet_balance + p_amount
  where id = v_brand_id
  returning wallet_balance into v_new_balance;

  insert into public.invoices (brand_id, kind, amount, status)
  values (v_brand_id, 'top_up', p_amount, 'paid');

  return v_new_balance;
end;
$$;

-- --- profiles no longer carries brand identity ------------------------------
-- wallet_balance stays: it's also read by the Creator Portal's own topbar
-- (a creator's wallet, unrelated to a brand's ad-spend budget) — the two
-- concepts happened to share a column before this migration. Only the
-- fields with no creator-side meaning are removed.
alter table public.profiles
  drop column company_name,
  drop column industry,
  drop column website,
  drop column logo_url;
