-- Security fix (production-readiness audit, blocker #1): the existing
-- "brands: members can update" RLS policy is row-scoped only (any member
-- of the space, not just the owner) — with no column restriction, any
-- authenticated member could call `.from("brands").update({ wallet_balance
-- : ... })` directly from the client SDK, crediting themselves funds while
-- completely bypassing add_budget()'s minimum-amount check and its
-- matching invoice row.
--
-- RLS restricts WHICH ROWS a role can touch; it does not restrict WHICH
-- COLUMNS. Column-level privileges do, and are independent of RLS, so
-- this closes the gap without touching the policy itself. add_budget()
-- (migration 0015) is `security definer`, so it runs with the function
-- owner's privileges rather than the caller's — this revoke does not
-- affect it, top-ups keep working exactly as before.
revoke update on public.brands from authenticated;

grant update (
  company_name, website, tagline, industry, company_size,
  product_description, product_summary, product_features,
  product_differentiators, product_summary_status, product_summary_error,
  logo_url, marketplace_explored_at
) on public.brands to authenticated;

-- Defense in depth: make the policy's own intent explicit (Postgres
-- already defaults an omitted WITH CHECK to reuse USING for UPDATE, so
-- this doesn't change behavior — it just stops that default from being
-- silently relied upon if the USING clause is ever loosened later).
drop policy "brands: members can update" on public.brands;
create policy "brands: members can update"
  on public.brands for update
  using (public.is_brand_member(id))
  with check (public.is_brand_member(id));
