-- Real backend for the Messages tab's brand<->creator conversations.
--
-- Reuses `bookings` as the conversation key (one thread per booking)
-- rather than introducing a separate `conversations` concept — a booking
-- already exists from the moment a brand sends an invite (status
-- 'invited', migration 0017), covering negotiation through completion,
-- and both portals already load bookings scoped to "their own" via
-- existing helpers (is_own_campaign_booking / creators.user_id). NaanoBot
-- (the assistant thread) stays exactly as it is today — client-side only,
-- unrelated to this table.
create table public.messages (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  sender_role text not null check (sender_role in ('brand', 'creator')),
  body text not null check (char_length(btrim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create index messages_booking_id_idx on public.messages (booking_id, created_at);

create policy "messages: brand can view own booking threads"
  on public.messages for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and public.is_own_campaign_booking(b.campaign_id)
    )
  );

create policy "messages: creator can view own booking threads"
  on public.messages for select
  using (
    exists (
      select 1 from public.bookings b
      join public.creators cr on cr.id = b.creator_id
      where b.id = booking_id and cr.user_id = auth.uid()
    )
  );

-- Insert policies double as the identity check: a client can't insert a
-- message claiming the other side's sender_role, since it would fail
-- BOTH policies (fails this one's sender_role check, fails the other
-- one's ownership check).
create policy "messages: brand can send on own booking threads"
  on public.messages for insert
  with check (
    sender_role = 'brand'
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id and public.is_own_campaign_booking(b.campaign_id)
    )
  );

create policy "messages: creator can send on own booking threads"
  on public.messages for insert
  with check (
    sender_role = 'creator'
    and exists (
      select 1 from public.bookings b
      join public.creators cr on cr.id = b.creator_id
      where b.id = booking_id and cr.user_id = auth.uid()
    )
  );

-- No UPDATE/DELETE policy at all: messages are immutable once sent (no
-- edit/delete feature), and "mark read" is a narrow RPC below rather than
-- a general row UPDATE grant — a broad "you can update rows in your own
-- thread" policy would let either side silently rewrite the OTHER
-- party's message body, not just their own read state.
create function public.mark_messages_read(p_booking_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_is_brand boolean := false;
  v_is_creator boolean := false;
begin
  select public.is_own_campaign_booking(campaign_id) into v_is_brand
  from public.bookings where id = p_booking_id;

  select exists (
    select 1 from public.bookings b
    join public.creators cr on cr.id = b.creator_id
    where b.id = p_booking_id and cr.user_id = auth.uid()
  ) into v_is_creator;

  if not coalesce(v_is_brand, false) and not v_is_creator then
    raise exception 'Not part of this conversation';
  end if;

  -- Mark the OTHER side's messages read, never your own.
  update public.messages
  set read_at = now()
  where booking_id = p_booking_id
    and read_at is null
    and sender_role <> case when v_is_brand then 'brand' else 'creator' end;
end;
$$;

grant execute on function public.mark_messages_read(uuid) to authenticated;
