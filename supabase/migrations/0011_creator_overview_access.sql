-- Two real gaps found while building the Creator Overview tab:
--
-- 1. No policy let a creator read a brand's company_name at all — every
--    `profiles` policy was owner-only. Without this, "Active collaborations"
--    could show a booking but never the brand's name.
-- 2. `campaigns` was only visible to a creator once they already had a
--    booking on it — which is circular for "Recommended opportunities"
--    (discovering campaigns to pitch happens *before* any booking exists).

create policy "profiles: creator can view brand name for own bookings"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.bookings b
      join public.campaigns c on c.id = b.campaign_id
      join public.creators cr on cr.id = b.creator_id
      where c.brand_id = profiles.id and cr.user_id = auth.uid()
    )
  );

create policy "campaigns: authenticated users can browse active campaigns"
  on public.campaigns for select
  to authenticated
  using (status = 'active');
