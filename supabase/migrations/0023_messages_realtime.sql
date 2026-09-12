-- Live delivery for the Messages tab: Supabase Realtime's postgres_changes
-- respects RLS automatically (same policies from 0022_messages.sql), so
-- adding the table to the publication is the only backend change needed —
-- no separate "who can see this event" logic to duplicate client-side.
alter publication supabase_realtime add table public.messages;
