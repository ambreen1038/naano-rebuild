-- Two-sided signup: the app was brand-only until now (profiles.company_name
-- was NOT NULL and handle_new_user always created a brand profile). This adds
-- a real creator role with resumable onboarding.

-- ---------------------------------------------------------------------------
-- profiles: role, and company_name becomes optional (creators have no company)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column role text not null default 'brand'
    check (role in ('brand', 'creator'));

alter table public.profiles alter column company_name drop not null;

-- ---------------------------------------------------------------------------
-- creator_onboarding: in-progress state, so a creator who leaves midway
-- resumes at the right step. The live marketplace row in `creators` is only
-- created on completion, which keeps that table's NOT NULL guarantees intact.
-- ---------------------------------------------------------------------------
create table public.creator_onboarding (
  user_id uuid primary key references auth.users (id) on delete cascade,
  step smallint not null default 2 check (step between 2 and 4),
  linkedin_url text,
  linkedin_name text,
  linkedin_headline text,
  linkedin_avatar_url text,
  linkedin_follower_count integer check (linkedin_follower_count >= 0),
  linkedin_imported_at timestamptz,
  country text,
  industry_tags text[] not null default '{}',
  price_per_post numeric(10, 2) check (price_per_post >= 0),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.creator_onboarding enable row level security;

create policy "creator_onboarding: owner can read"
  on public.creator_onboarding for select
  using (auth.uid() = user_id);

create policy "creator_onboarding: owner can insert"
  on public.creator_onboarding for insert
  with check (auth.uid() = user_id);

create policy "creator_onboarding: owner can update"
  on public.creator_onboarding for update
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- creators: link a signed-up creator to their marketplace card. Seeded demo
-- creators keep user_id null. `vertical` was superseded by industry_tags for
-- new rows, so it becomes optional.
-- ---------------------------------------------------------------------------
alter table public.creators
  add column user_id uuid unique references auth.users (id) on delete cascade;

alter table public.creators alter column vertical drop not null;

create policy "creators: owner can update own card"
  on public.creators for update
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Role-aware signup trigger
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text := coalesce(new.raw_user_meta_data ->> 'role', 'brand');
begin
  if v_role = 'creator' then
    insert into public.profiles (id, role, full_name, industry)
    values (
      new.id,
      'creator',
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        ''
      ),
      'other'
    );

    insert into public.creator_onboarding (user_id, step)
    values (new.id, 2);
  else
    insert into public.profiles (id, role, company_name, industry, full_name)
    values (
      new.id,
      'brand',
      coalesce(new.raw_user_meta_data ->> 'company_name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data ->> 'industry', 'other'),
      coalesce(new.raw_user_meta_data ->> 'full_name', '')
    );
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Completing onboarding creates the marketplace card and marks the row done.
-- One transaction, so we can't end up with a "completed" onboarding that has
-- no card (the same failure mode that bit the billing top-up).
-- ---------------------------------------------------------------------------
create function public.complete_creator_onboarding()
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_onboarding public.creator_onboarding;
  v_creator_id uuid;
begin
  select * into v_onboarding
  from public.creator_onboarding
  where user_id = auth.uid();

  if v_onboarding.user_id is null then
    raise exception 'No onboarding in progress';
  end if;

  if v_onboarding.linkedin_name is null or v_onboarding.linkedin_name = '' then
    raise exception 'LinkedIn profile is required';
  end if;

  if v_onboarding.country is null or v_onboarding.country = '' then
    raise exception 'Country is required';
  end if;

  if array_length(v_onboarding.industry_tags, 1) is null then
    raise exception 'Pick at least one industry';
  end if;

  if v_onboarding.price_per_post is null then
    raise exception 'Price per post is required';
  end if;

  insert into public.creators (
    user_id, name, headline, avatar_url, country,
    follower_count, price_per_post, linkedin_url, industry_tags
  )
  values (
    auth.uid(),
    v_onboarding.linkedin_name,
    coalesce(v_onboarding.linkedin_headline, ''),
    v_onboarding.linkedin_avatar_url,
    v_onboarding.country,
    coalesce(v_onboarding.linkedin_follower_count, 0),
    v_onboarding.price_per_post,
    v_onboarding.linkedin_url,
    v_onboarding.industry_tags
  )
  on conflict (user_id) do update
    set name = excluded.name,
        headline = excluded.headline,
        avatar_url = excluded.avatar_url,
        country = excluded.country,
        follower_count = excluded.follower_count,
        price_per_post = excluded.price_per_post,
        linkedin_url = excluded.linkedin_url,
        industry_tags = excluded.industry_tags
  returning id into v_creator_id;

  update public.creator_onboarding
  set step = 4, completed_at = now()
  where user_id = auth.uid();

  return v_creator_id;
end;
$$;

grant execute on function public.complete_creator_onboarding() to authenticated;

-- ---------------------------------------------------------------------------
-- Creator-side read access. Until now every policy was brand-scoped, so a
-- signed-in creator could not see the bookings addressed to them.
-- ---------------------------------------------------------------------------
create policy "bookings: creator can view own bookings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.creators c
      where c.id = bookings.creator_id and c.user_id = auth.uid()
    )
  );

create policy "campaigns: creator can view campaigns they are booked on"
  on public.campaigns for select
  using (
    exists (
      select 1
      from public.bookings b
      join public.creators c on c.id = b.creator_id
      where b.campaign_id = campaigns.id and c.user_id = auth.uid()
    )
  );

create policy "click_events: creator can view clicks on own bookings"
  on public.click_events for select
  using (
    exists (
      select 1
      from public.bookings b
      join public.creators c on c.id = b.creator_id
      where b.id = click_events.booking_id and c.user_id = auth.uid()
    )
  );
