-- The mention helper is only for database triggers (which run as the owner).
-- Without this, anyone with the public key could call it to test whether an
-- email belongs to the team. Safe to re-run.
revoke all on function public.mentioned_members(text) from public, anon, authenticated;
revoke all on function public.current_email() from public, anon;
