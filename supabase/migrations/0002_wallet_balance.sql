-- Adds a wallet balance to each brand profile, used by the dashboard topbar
-- and the "top up your wallet" onboarding nudge.
alter table public.profiles
  add column wallet_balance numeric(10, 2) not null default 0;
