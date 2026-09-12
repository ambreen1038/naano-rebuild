-- Backend for the Creator Portal's My Card preview/edit modes, price &
-- bundle editing, and profile photo upload.
--
-- `about` is one freeform text field (bio, projects, education, contact —
-- whatever the creator writes), not a set of separate structured columns:
-- the reference design's "About" section is just a paragraph of text, the
-- same shape as the existing `headline` field, so this follows that
-- precedent rather than inventing a rigid sub-schema.
--
-- The reference design also shows a per-section hide/show toggle in Edit
-- mode; these three flags are the real, persisted state behind it (drag-
-- to-reorder and "Add a section" have no such backing — not implemented).
alter table public.creators
  add column about text,
  add column about_hidden boolean not null default false,
  add column metrics_hidden boolean not null default false,
  add column pricing_hidden boolean not null default false,
  add column bundle_post_count integer check (bundle_post_count > 0);

-- Storage bucket for creator avatars, public read (a creator's photo is
-- meant to be visible on their public marketplace card and shared-card
-- link), writes restricted to the owning user's own folder.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: public can view"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: owner can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: owner can update own folder"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: owner can delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
