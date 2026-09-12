-- Brand-initiated invitations, booking, and negotiation.
--
-- Reuses `bookings` as the single shared collaboration record (rather than
-- a separate "invitations" table) — a booking now starts life as
-- status='invited' (brand sent an offer, creator hasn't responded),
-- becomes 'draft' on accept (the existing "brief in review" stage,
-- unchanged) or 'declined' on decline. Both Brand and Creator Portals
-- already read this same table, so no dual data model is introduced.
--
-- `booking_offers` records the negotiation thread when a brand proposes an
-- amount other than the creator's listed rate — one shared row both
-- portals read, not separate Brand/Creator copies.

alter table public.bookings drop constraint bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('invited', 'draft', 'scheduled', 'live', 'completed', 'declined'));

alter table public.bookings
  add column post_by_date date,
  add column work_mode text check (work_mode in ('specific_brief', 'creative_freedom')),
  add column content_approval text check (content_approval in ('auto', 'manual')),
  add column invited_at timestamptz,
  add column responded_at timestamptz;

create table public.booking_offers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  offered_by text not null check (offered_by in ('brand', 'creator')),
  amount numeric(10, 2) not null check (amount >= 0),
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.booking_offers enable row level security;

create index booking_offers_booking_id_idx on public.booking_offers (booking_id);

-- Brand manages offers on bookings under their own (active) campaigns —
-- reuses is_own_campaign_booking rather than duplicating the ownership
-- check.
create policy "booking_offers: brand can manage on own campaigns"
  on public.booking_offers for all
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and public.is_own_campaign_booking(b.campaign_id)
    )
  )
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and public.is_own_campaign_booking(b.campaign_id)
    )
  );

create policy "booking_offers: creator can view own"
  on public.booking_offers for select
  using (
    exists (
      select 1 from public.bookings b
      join public.creators cr on cr.id = b.creator_id
      where b.id = booking_id and cr.user_id = auth.uid()
    )
  );

-- Creating invitations: one call handles both the bulk "Group selection"
-- flow (N creators, same terms) and a single "Book at listed rate" —
-- the array just has one element in the latter case, no separate RPC
-- needed. No offer row: the price matches what the creator already asks,
-- nothing to negotiate.
create function public.create_booking_invites(
  p_campaign_id uuid,
  p_creator_ids uuid[],
  p_prices numeric[],
  p_post_by_date date,
  p_work_mode text,
  p_content_approval text
)
returns uuid[]
language plpgsql
security definer set search_path = public
as $$
declare
  v_ids uuid[] := '{}';
  v_id uuid;
  i int;
begin
  if not public.is_own_campaign_booking(p_campaign_id) then
    raise exception 'Not your campaign';
  end if;

  if array_length(p_creator_ids, 1) is null
     or array_length(p_creator_ids, 1) <> array_length(p_prices, 1) then
    raise exception 'Creator and price lists must match';
  end if;

  for i in 1 .. array_length(p_creator_ids, 1) loop
    insert into public.bookings (
      campaign_id, creator_id, price_agreed, status,
      post_by_date, work_mode, content_approval, invited_at
    ) values (
      p_campaign_id, p_creator_ids[i], p_prices[i], 'invited',
      p_post_by_date, p_work_mode, p_content_approval, now()
    )
    returning id into v_id;
    v_ids := array_append(v_ids, v_id);
  end loop;

  return v_ids;
end;
$$;

grant execute on function public.create_booking_invites(uuid, uuid[], numeric[], date, text, text) to authenticated;

-- Negotiating: same invite, plus a real offer row so both portals see the
-- same proposed amount and its status.
create function public.create_negotiated_booking_invite(
  p_campaign_id uuid,
  p_creator_id uuid,
  p_amount numeric,
  p_post_by_date date,
  p_work_mode text,
  p_content_approval text,
  p_message text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_booking_id uuid;
begin
  if not public.is_own_campaign_booking(p_campaign_id) then
    raise exception 'Not your campaign';
  end if;

  insert into public.bookings (
    campaign_id, creator_id, price_agreed, status,
    post_by_date, work_mode, content_approval, invited_at
  ) values (
    p_campaign_id, p_creator_id, p_amount, 'invited',
    p_post_by_date, p_work_mode, p_content_approval, now()
  )
  returning id into v_booking_id;

  insert into public.booking_offers (booking_id, offered_by, amount, message)
  values (v_booking_id, 'brand', p_amount, p_message);

  return v_booking_id;
end;
$$;

grant execute on function public.create_negotiated_booking_invite(uuid, uuid, numeric, date, text, text, text) to authenticated;

-- Creator accept/decline. Validated server-side (not just hidden in the
-- UI): only the invited creator, and only while still 'invited' — a
-- direct API call can't skip either check.
create function public.respond_to_booking_invite(p_booking_id uuid, p_response text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_creator_id uuid;
  v_status text;
begin
  if p_response not in ('accept', 'decline') then
    raise exception 'Invalid response';
  end if;

  select cr.id, b.status into v_creator_id, v_status
  from public.bookings b
  join public.creators cr on cr.id = b.creator_id
  where b.id = p_booking_id and cr.user_id = auth.uid();

  if v_creator_id is null then
    raise exception 'Invitation not found';
  end if;
  if v_status <> 'invited' then
    raise exception 'This invitation is no longer pending';
  end if;

  update public.bookings
  set status = case when p_response = 'accept' then 'draft' else 'declined' end,
      responded_at = now()
  where id = p_booking_id;

  update public.booking_offers
  set status = case when p_response = 'accept' then 'accepted' else 'declined' end
  where booking_id = p_booking_id and status = 'pending';
end;
$$;

grant execute on function public.respond_to_booking_invite(uuid, text) to authenticated;
