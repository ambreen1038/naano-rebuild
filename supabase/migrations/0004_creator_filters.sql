-- Adds the fields needed by the Creators marketplace filter UI
-- (industry tags, price range histogram, performance filters).
alter table public.creators
  add column industry_tags text[] not null default '{}',
  add column median_views integer,
  add column cpm numeric(10, 2),
  add column engagement_rate numeric(5, 2),
  add column last_posted_at date;

create index creators_industry_tags_idx on public.creators using gin (industry_tags);
