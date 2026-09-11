-- Backfills industry tags and performance metrics for the 20 creators
-- seeded in supabase/seed.sql, matched by name (that seed has no stable id
-- to key off, and this only needs to run once against the existing rows).

update public.creators set industry_tags = array['Sales','Outreach','CRM'], median_views = 14500, cpm = 15, engagement_rate = 5.2, last_posted_at = current_date - 3 where name = 'Dara Kessler';
update public.creators set industry_tags = array['RevOps','SaaS','Data'], median_views = 6200, cpm = 13, engagement_rate = 6.1, last_posted_at = current_date - 8 where name = 'Milo Andrade';
update public.creators set industry_tags = array['DevTools','Software','AI'], median_views = 22000, cpm = 11, engagement_rate = 4.4, last_posted_at = current_date - 2 where name = 'Priya Nandakumar';
update public.creators set industry_tags = array['Product','Growth / GTM','SaaS'], median_views = 4100, cpm = 12, engagement_rate = 7.3, last_posted_at = current_date - 15 where name = 'Sana Okafor';
update public.creators set industry_tags = array['HR','SaaS'], median_views = 9800, cpm = 14, engagement_rate = 5.5, last_posted_at = current_date - 6 where name = 'Tobias Renn';
update public.creators set industry_tags = array['Fintech','Finance','B2B'], median_views = 31000, cpm = 10, engagement_rate = 3.2, last_posted_at = current_date - 1 where name = 'Camille Duthoit';
update public.creators set industry_tags = array['Marketing','CRM','Data'], median_views = 3600, cpm = 13, engagement_rate = 6.8, last_posted_at = current_date - 20 where name = 'Ravi Bhatt';
update public.creators set industry_tags = array['SaaS','B2B','Growth / GTM'], median_views = 12500, cpm = 14, engagement_rate = 4.9, last_posted_at = current_date - 5 where name = 'Elena Marchetti';
update public.creators set industry_tags = array['Sales','Outreach','B2B'], median_views = 52000, cpm = 9, engagement_rate = 2.8, last_posted_at = current_date - 1 where name = 'Jonah Pierce';
update public.creators set industry_tags = array['RevOps','Data','SaaS'], median_views = 2400, cpm = 15, engagement_rate = 8.1, last_posted_at = current_date - 25 where name = 'Aiko Tanaka';
update public.creators set industry_tags = array['DevTools','Software','AI'], median_views = 118000, cpm = 7, engagement_rate = 2.1, last_posted_at = current_date - 2 where name = 'Noah Fischbein';
update public.creators set industry_tags = array['Product','Growth / GTM','SaaS'], median_views = 8600, cpm = 13, engagement_rate = 5.9, last_posted_at = current_date - 9 where name = 'Yasmin Farouk';
update public.creators set industry_tags = array['HR','SaaS'], median_views = 1600, cpm = 14, engagement_rate = 8.9, last_posted_at = current_date - 18 where name = 'Declan Murphy';
update public.creators set industry_tags = array['Fintech','Finance'], median_views = 16500, cpm = 12, engagement_rate = 4.6, last_posted_at = current_date - 4 where name = 'Bianca Souza';
update public.creators set industry_tags = array['Marketing','AI','CRM'], median_views = 24000, cpm = 11, engagement_rate = 4.1, last_posted_at = current_date - 3 where name = 'Karim El-Sayed';
update public.creators set industry_tags = array['SaaS','B2B','Product'], median_views = 5300, cpm = 15, engagement_rate = 6.5, last_posted_at = current_date - 11 where name = 'Freya Solberg';
update public.creators set industry_tags = array['Sales','B2B','Outreach'], median_views = 19500, cpm = 12, engagement_rate = 4.8, last_posted_at = current_date - 7 where name = 'Marcus Lindqvist';
update public.creators set industry_tags = array['RevOps','Data'], median_views = 900, cpm = 16, engagement_rate = 9.4, last_posted_at = current_date - 30 where name = 'Chidinma Eze';
update public.creators set industry_tags = array['DevTools','Software','Growth / GTM'], median_views = 10800, cpm = 13, engagement_rate = 5.4, last_posted_at = current_date - 6 where name = 'Hugo Lefebvre';
update public.creators set industry_tags = array['Product','Software','SaaS'], median_views = 17800, cpm = 11, engagement_rate = 4.3, last_posted_at = current_date - 4 where name = 'Meera Iyer';
