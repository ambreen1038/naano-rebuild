-- Part 2: creator counter-negotiation. `booking_offers` already exists
-- (0017) as the single shared negotiation thread — this just lets a
-- counter-offer be proposed by EITHER side, not only the brand, and adds
-- 'countered' so a superseded row keeps an honest final status instead of
-- being stuck 'pending' forever once a newer offer replaces it.
alter table public.booking_offers drop constraint booking_offers_status_check;
alter table public.booking_offers add constraint booking_offers_status_check
  check (status in ('pending', 'accepted', 'declined', 'countered'));

-- Creator proposes a different amount. Only while the invite is still
-- 'invited' (open for negotiation) — validated here, not just in the UI.
create function public.creator_counter_offer(
  p_booking_id uuid,
  p_amount numeric,
  p_message text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_creator_id uuid;
  v_status text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Enter a valid offer amount';
  end if;

  select cr.id, b.status into v_creator_id, v_status
  from public.bookings b
  join public.creators cr on cr.id = b.creator_id
  where b.id = p_booking_id and cr.user_id = auth.uid();

  if v_creator_id is null then
    raise exception 'Invitation not found';
  end if;
  if v_status <> 'invited' then
    raise exception 'This invitation is no longer open for negotiation';
  end if;

  update public.booking_offers
  set status = 'countered'
  where booking_id = p_booking_id and status = 'pending';

  insert into public.booking_offers (booking_id, offered_by, amount, message)
  values (p_booking_id, 'creator', p_amount, p_message);
end;
$$;

grant execute on function public.creator_counter_offer(uuid, numeric, text) to authenticated;

-- Brand proposes a different amount in response to a creator's counter
-- (a follow-up negotiation round, distinct from create_negotiated_booking_invite
-- which starts a brand-new invitation).
create function public.brand_counter_offer(
  p_booking_id uuid,
  p_amount numeric,
  p_message text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_status text;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Enter a valid offer amount';
  end if;

  select campaign_id, status into v_campaign_id, v_status
  from public.bookings where id = p_booking_id;

  if v_campaign_id is null then
    raise exception 'Booking not found';
  end if;
  if not public.is_own_campaign_booking(v_campaign_id) then
    raise exception 'Not your booking';
  end if;
  if v_status <> 'invited' then
    raise exception 'This invitation is no longer open for negotiation';
  end if;

  update public.booking_offers
  set status = 'countered'
  where booking_id = p_booking_id and status = 'pending';

  insert into public.booking_offers (booking_id, offered_by, amount, message)
  values (p_booking_id, 'brand', p_amount, p_message);
end;
$$;

grant execute on function public.brand_counter_offer(uuid, numeric, text) to authenticated;

-- respond_to_booking_invite (creator accept/decline, from 0017) now also
-- resolves the current pending offer, so accepting after a negotiation
-- round locks in the actually-agreed amount rather than the original
-- invite price. Backward compatible: a plain invite with no offer row at
-- all still behaves exactly as before.
create or replace function public.respond_to_booking_invite(p_booking_id uuid, p_response text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_creator_id uuid;
  v_status text;
  v_offer_id uuid;
  v_offer_by text;
  v_offer_amount numeric;
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

  select id, offered_by, amount into v_offer_id, v_offer_by, v_offer_amount
  from public.booking_offers
  where booking_id = p_booking_id and status = 'pending'
  order by created_at desc
  limit 1;

  if v_offer_id is not null and v_offer_by <> 'brand' then
    raise exception 'Waiting on the brand to respond to your own counter-offer';
  end if;

  update public.bookings
  set status = case when p_response = 'accept' then 'draft' else 'declined' end,
      responded_at = now(),
      price_agreed = case
        when p_response = 'accept' and v_offer_amount is not null then v_offer_amount
        else price_agreed
      end
  where id = p_booking_id;

  if v_offer_id is not null then
    update public.booking_offers
    set status = case when p_response = 'accept' then 'accepted' else 'declined' end
    where id = v_offer_id;
  end if;
end;
$$;

-- Brand's side of the same thing: accept/decline the creator's current
-- counter-offer.
create function public.brand_respond_to_offer(p_booking_id uuid, p_response text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_status text;
  v_offer_id uuid;
  v_offer_by text;
  v_offer_amount numeric;
begin
  if p_response not in ('accept', 'decline') then
    raise exception 'Invalid response';
  end if;

  select campaign_id, status into v_campaign_id, v_status
  from public.bookings where id = p_booking_id;

  if v_campaign_id is null then
    raise exception 'Booking not found';
  end if;
  if not public.is_own_campaign_booking(v_campaign_id) then
    raise exception 'Not your booking';
  end if;
  if v_status <> 'invited' then
    raise exception 'This invitation is no longer pending';
  end if;

  select id, offered_by, amount into v_offer_id, v_offer_by, v_offer_amount
  from public.booking_offers
  where booking_id = p_booking_id and status = 'pending'
  order by created_at desc
  limit 1;

  if v_offer_id is null or v_offer_by <> 'creator' then
    raise exception 'No pending counter-offer from the creator';
  end if;

  update public.bookings
  set status = case when p_response = 'accept' then 'draft' else 'declined' end,
      responded_at = now(),
      price_agreed = case when p_response = 'accept' then v_offer_amount else price_agreed end
  where id = p_booking_id;

  update public.booking_offers
  set status = case when p_response = 'accept' then 'accepted' else 'declined' end
  where id = v_offer_id;
end;
$$;

grant execute on function public.brand_respond_to_offer(uuid, text) to authenticated;

-- Part 3: brand responds to a creator-initiated campaign application
-- (campaign_applications, 0014) — the missing "Invitations received" side.
-- Reuses the same campaign-ownership check as everything else; no new
-- application system, just the response action that table never had.
create function public.respond_to_campaign_application(p_application_id uuid, p_response text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_status text;
begin
  if p_response not in ('accepted', 'declined') then
    raise exception 'Invalid response';
  end if;

  select campaign_id, status into v_campaign_id, v_status
  from public.campaign_applications where id = p_application_id;

  if v_campaign_id is null then
    raise exception 'Application not found';
  end if;
  if not public.is_own_campaign_booking(v_campaign_id) then
    raise exception 'Not your campaign';
  end if;
  if v_status <> 'pending' then
    raise exception 'This application has already been responded to';
  end if;

  update public.campaign_applications
  set status = p_response
  where id = p_application_id;
end;
$$;

grant execute on function public.respond_to_campaign_application(uuid, text) to authenticated;
