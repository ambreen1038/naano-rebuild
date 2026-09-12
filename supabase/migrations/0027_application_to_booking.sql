-- Closes the gap found in the Creator Portal audit: accepting a creator's
-- application (respond_to_campaign_application, 0018) only flipped
-- campaign_applications.status — no booking was ever created, so an
-- "accepted" application was a dead end with nothing for the creator to
-- act on.
--
-- Accepting now also creates a real `bookings` row at the creator's own
-- listed rate (an application carries no price of its own to fall back
-- on), status 'invited' — the exact same entry point create_booking_invites
-- (0017) uses for a brand-initiated invite. From this point on, an
-- accepted application and a brand-sent invite go through the identical
-- accept/decline/negotiate pipeline — not a second parallel one.
create or replace function public.respond_to_campaign_application(p_application_id uuid, p_response text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_creator_id uuid;
  v_status text;
  v_price numeric(10, 2);
begin
  if p_response not in ('accepted', 'declined') then
    raise exception 'Invalid response';
  end if;

  select campaign_id, creator_id, status into v_campaign_id, v_creator_id, v_status
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

  if p_response = 'accepted' then
    -- Idempotency guard: if this creator was already invited/booked on
    -- this same campaign some other way, don't create a second booking.
    if not exists (
      select 1 from public.bookings
      where campaign_id = v_campaign_id and creator_id = v_creator_id
    ) then
      select price_per_post into v_price
      from public.creators where id = v_creator_id;

      insert into public.bookings (
        campaign_id, creator_id, price_agreed, status,
        post_by_date, work_mode, content_approval, invited_at
      ) values (
        v_campaign_id, v_creator_id, coalesce(v_price, 0), 'invited',
        (current_date + interval '14 days')::date, 'specific_brief', 'auto', now()
      );
    end if;
  end if;
end;
$$;
