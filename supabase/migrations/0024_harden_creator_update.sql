-- Hardening (production-readiness audit): "creators: owner can update own
-- card" (migration 0009) had only a USING clause. Postgres already
-- defaults an omitted WITH CHECK to reuse USING for UPDATE, so this was
-- never actually exploitable (a creator couldn't touch another creator's
-- row, or reassign user_id to hijack a different card) — but it relied on
-- that implicit default rather than being self-documenting, the same
-- thing migration 0021 deliberately made explicit for `brands`. Doing the
-- same here so a future change to USING can't silently loosen this
-- without a matching, visible WITH CHECK to update alongside it.
drop policy "creators: owner can update own card" on public.creators;
create policy "creators: owner can update own card"
  on public.creators for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
