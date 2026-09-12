-- Real signal for the Brand Portal's "Launch Plan" checklist (Topbar "Get
-- started" pill). Two of its three steps already have an honest completion
-- signal in existing tables (a campaign row exists / a booking row
-- exists) — this adds the one that doesn't: "explored the marketplace" has
-- no table to derive it from, so this timestamp records the one real
-- action (visiting /brand/creators) that step is actually about. Set once,
-- server-side, the first time that page loads for a brand — never
-- fabricated or toggled by the client.
alter table public.brands add column marketplace_explored_at timestamptz;
