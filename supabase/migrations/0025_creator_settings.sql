-- Backend for the Creator Portal Settings page (Profile / Payments /
-- Account tabs). No new RLS needed: "creators: owner can update own card"
-- (hardened in 0024) already covers these new columns the same way it
-- covers every existing one.
alter table public.creators
  add column twitter_url text,
  add column linkedin_refreshed_at timestamptz,
  add column bank_account_holder text,
  add column bank_iban text,
  add column bank_name text;
