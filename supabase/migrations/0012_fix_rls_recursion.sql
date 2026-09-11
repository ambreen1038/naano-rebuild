-- Fixes a real bug: querying `profiles` for a creator triggered
-- "infinite recursion detected in policy for relation bookings".
--
-- The cycle: profiles' new policy (0011) queries bookings -> bookings'
-- "brand can manage" policy queries campaigns -> campaigns' "creator can
-- view campaigns they are booked on" policy (0009) queries bookings again.
-- That campaigns<->bookings cycle existed since 0009; migration 0011's
-- profiles policy was just the query shape that finally hit it.
--
-- Standard fix: move each cross-table check into a SECURITY DEFINER
-- function. These run with the function owner's privileges, which bypass
-- RLS on tables they own (no FORCE ROW LEVEL SECURITY is set anywhere in
-- this schema), so the inner lookups no longer re-trigger the other
-- table's policies — breaking the cycle instead of papering over it.

create function public.is_own_campaign_booking(p_campaign_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.campaigns c
    where c.id = p_campaign_id and c.brand_id = auth.uid()
  );
$$;

create function public.creator_booked_on_campaign(p_campaign_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.bookings b
    join public.creators cr on cr.id = b.creator_id
    where b.campaign_id = p_campaign_id and cr.user_id = auth.uid()
  );
$$;

create function public.creator_has_booking_with_brand(p_brand_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.bookings b
    join public.campaigns c on c.id = b.campaign_id
    join public.creators cr on cr.id = b.creator_id
    where c.brand_id = p_brand_id and cr.user_id = auth.uid()
  );
$$;

drop policy "bookings: brand can manage bookings on own campaigns" on public.bookings;
create policy "bookings: brand can manage bookings on own campaigns"
  on public.bookings for all
  using (public.is_own_campaign_booking(campaign_id))
  with check (public.is_own_campaign_booking(campaign_id));

drop policy "campaigns: creator can view campaigns they are booked on" on public.campaigns;
create policy "campaigns: creator can view campaigns they are booked on"
  on public.campaigns for select
  using (public.creator_booked_on_campaign(id));

drop policy "profiles: creator can view brand name for own bookings" on public.profiles;
create policy "profiles: creator can view brand name for own bookings"
  on public.profiles for select
  using (public.creator_has_booking_with_brand(id));
