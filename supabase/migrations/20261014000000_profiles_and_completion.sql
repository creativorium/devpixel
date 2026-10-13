-- Members rename themselves; tasks record when they were completed. Safe to re-run.

-- Each member may change only their own display name (not their email).
revoke update on public.members from authenticated;
grant update (display_name) on public.members to authenticated;
drop policy if exists "members rename themselves" on public.members;
create policy "members rename themselves" on public.members
  for update to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- completed_at powers "done this week" on the dashboard.
alter table public.tasks add column if not exists completed_at timestamptz;
update public.tasks set completed_at = updated_at
  where status = 'done' and completed_at is null;

create or replace function public.track_completion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'done' and (tg_op = 'INSERT' or old.status is distinct from 'done') then
    new.completed_at := now();
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;
drop trigger if exists tasks_completion on public.tasks;
create trigger tasks_completion before insert or update of status on public.tasks
  for each row execute function public.track_completion();
