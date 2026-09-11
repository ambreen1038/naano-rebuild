-- "My card" Preview shows a Bundle price field ("None set" when empty) that
-- has no home in the schema yet. Adding it for real rather than hardcoding
-- the empty state.
alter table public.creators add column bundle_price numeric(10, 2) check (bundle_price >= 0);
