-- Fields the Opportunities tab's card grid + brief drawer need that don't
-- exist yet. All nullable: the brand campaign-creation form doesn't collect
-- them yet either (out of scope for this pass), so real campaigns will show
-- these sections only when populated — never fabricated.
alter table public.campaigns
  add column channel text not null default 'linkedin' check (channel in ('linkedin', 'twitter')),
  add column target_regions text[] not null default '{}',
  add column application_deadline date,
  add column target_audience text,
  add column cta_do text,
  add column cta_dont text,
  add column tone text,
  add column content_angles text[] not null default '{}';

-- Real gap: active campaigns were browsable (0011), but the corresponding
-- brand's profile (company_name, website, logo_url) was not — every
-- profiles policy so far only covered a brand's own row or a brand a
-- creator already has a booking with. Opportunities shows brands the
-- creator has never interacted with yet, so this was a hard blocker, not
-- a nice-to-have.
create function public.brand_has_active_campaign(p_brand_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.campaigns c
    where c.brand_id = p_brand_id and c.status = 'active'
  );
$$;

create policy "profiles: authenticated users can view brand info for active campaigns"
  on public.profiles for select
  to authenticated
  using (public.brand_has_active_campaign(id));
