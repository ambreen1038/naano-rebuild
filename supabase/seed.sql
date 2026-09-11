-- Seed data for the creator marketplace. Fictional creators, not real people.
-- Auto-run by `supabase db reset`.

insert into public.creators
  (name, headline, avatar_url, vertical, follower_count, country, price_per_post, linkedin_url, sample_post_url)
values
  ('Dara Kessler', 'Helping founders sell without a sales team', null, 'sales-tech', 42000, 'United States', 380, 'https://linkedin.com/in/dara-kessler', 'https://linkedin.com/posts/dara-kessler-1'),
  ('Milo Andrade', 'RevOps for B2B SaaS, ex-Head of RevOps at a unicorn', null, 'revops', 15400, 'Portugal', 220, 'https://linkedin.com/in/milo-andrade', 'https://linkedin.com/posts/milo-andrade-1'),
  ('Priya Nandakumar', 'Building in public: devtools, CLIs, and the tools engineers actually want', null, 'devtools', 68000, 'India', 450, 'https://linkedin.com/in/priya-nandakumar', 'https://linkedin.com/posts/priya-nandakumar-1'),
  ('Sana Okafor', 'PM lessons from shipping 0-to-1 products', null, 'product', 9800, 'Nigeria', 140, 'https://linkedin.com/in/sana-okafor', 'https://linkedin.com/posts/sana-okafor-1'),
  ('Tobias Renn', 'HR-tech, people ops, and why your onboarding is broken', null, 'hr-tech', 26500, 'Germany', 260, 'https://linkedin.com/in/tobias-renn', 'https://linkedin.com/posts/tobias-renn-1'),
  ('Camille Duthoit', 'Fintech founder turned LinkedIn creator. Payments, compliance, GTM.', null, 'fintech', 112000, 'France', 620, 'https://linkedin.com/in/camille-duthoit', 'https://linkedin.com/posts/camille-duthoit-1'),
  ('Ravi Bhatt', 'Marketing ops nerd. Attribution, lifecycle, and the tools stack', null, 'marketing-ops', 8100, 'United Kingdom', 120, 'https://linkedin.com/in/ravi-bhatt', 'https://linkedin.com/posts/ravi-bhatt-1'),
  ('Elena Marchetti', 'Vertical SaaS GTM: legal-tech, insurance-tech, construction-tech', null, 'vertical-saas', 34700, 'Italy', 310, 'https://linkedin.com/in/elena-marchetti', 'https://linkedin.com/posts/elena-marchetti-1'),
  ('Jonah Pierce', 'Cold outbound is dead. Warm outbound from creator content is not.', null, 'sales-tech', 187000, 'United States', 900, 'https://linkedin.com/in/jonah-pierce', 'https://linkedin.com/posts/jonah-pierce-1'),
  ('Aiko Tanaka', 'RevOps + data: how I built a single source of truth for pipeline', null, 'revops', 5200, 'Japan', 90, 'https://linkedin.com/in/aiko-tanaka', 'https://linkedin.com/posts/aiko-tanaka-1'),
  ('Noah Fischbein', 'Open source maintainer. I write about devtools adoption and PLG', null, 'devtools', 493000, 'United States', 1450, 'https://linkedin.com/in/noah-fischbein', 'https://linkedin.com/posts/noah-fischbein-1'),
  ('Yasmin Farouk', 'Product-led growth, onboarding, and activation metrics', null, 'product', 21300, 'Egypt', 210, 'https://linkedin.com/in/yasmin-farouk', 'https://linkedin.com/posts/yasmin-farouk-1'),
  ('Declan Murphy', 'People leader turned creator. HR-tech reviews and hot takes', null, 'hr-tech', 3400, 'Ireland', 60, 'https://linkedin.com/in/declan-murphy', 'https://linkedin.com/posts/declan-murphy-1'),
  ('Bianca Souza', 'Fintech compliance simplified for founders who hate reading regs', null, 'fintech', 47600, 'Brazil', 400, 'https://linkedin.com/in/bianca-souza', 'https://linkedin.com/posts/bianca-souza-1'),
  ('Karim El-Sayed', 'Marketing ops + AI: automating the boring 80% of demand gen', null, 'marketing-ops', 76200, 'United Arab Emirates', 480, 'https://linkedin.com/in/karim-el-sayed', 'https://linkedin.com/posts/karim-el-sayed-1'),
  ('Freya Solberg', 'Vertical SaaS founder advising other vertical SaaS founders', null, 'vertical-saas', 12900, 'Norway', 175, 'https://linkedin.com/in/freya-solberg', 'https://linkedin.com/posts/freya-solberg-1'),
  ('Marcus Lindqvist', 'Enterprise sales, 15 years in. I post what actually closes deals', null, 'sales-tech', 61500, 'Sweden', 410, 'https://linkedin.com/in/marcus-lindqvist', 'https://linkedin.com/posts/marcus-lindqvist-1'),
  ('Chidinma Eze', 'Early-career RevOps, learning in public', null, 'revops', 1800, 'Nigeria', 40, 'https://linkedin.com/in/chidinma-eze', 'https://linkedin.com/posts/chidinma-eze-1'),
  ('Hugo Lefebvre', 'Devtools go-to-market: from GitHub stars to paying customers', null, 'devtools', 29400, 'France', 290, 'https://linkedin.com/in/hugo-lefebvre', 'https://linkedin.com/posts/hugo-lefebvre-1'),
  ('Meera Iyer', 'B2B product management, told through real roadmap mistakes', null, 'product', 54800, 'India', 370, 'https://linkedin.com/in/meera-iyer', 'https://linkedin.com/posts/meera-iyer-1');
