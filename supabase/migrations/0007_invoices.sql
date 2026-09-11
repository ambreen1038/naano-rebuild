-- Billing tab: a real invoices ledger. Top-ups are simulated (this rebuild
-- never touches a real payment processor, matching the earlier decision to
-- skip real Stripe Connect for payouts) but every row here is a genuine
-- database record, not display-only mock data.
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.profiles (id) on delete cascade,
  reference text not null unique default ('INV-' || upper(encode(gen_random_bytes(4), 'hex'))),
  kind text not null check (kind in ('top_up', 'booking')),
  amount numeric(10, 2) not null check (amount > 0),
  status text not null default 'paid' check (status in ('paid', 'pending', 'failed')),
  booking_id uuid references public.bookings (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "invoices: brand can view own"
  on public.invoices for select
  using (auth.uid() = brand_id);

-- Only top-ups are ever client-inserted (the simulated payment flow).
-- "booking" invoices would be written by a future payout-processing step,
-- not by the brand directly, so no insert policy covers that kind.
create policy "invoices: brand can record own top-ups"
  on public.invoices for insert
  with check (auth.uid() = brand_id and kind = 'top_up');

create index invoices_brand_id_idx on public.invoices (brand_id);
