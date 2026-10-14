-- Optional manual time logs, enabled per project by admins. Safe to rerun.
begin;
alter table public.projects add column if not exists time_tracking_enabled boolean not null default false;
create or replace function public.guard_time_tracking_flag()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() and ((tg_op='INSERT' and new.time_tracking_enabled) or (tg_op='UPDATE' and new.time_tracking_enabled is distinct from old.time_tracking_enabled)) then
    raise exception 'Only admins can enable time logging.';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_time_tracking_flag on public.projects;
create trigger guard_time_tracking_flag before insert or update on public.projects for each row execute function public.guard_time_tracking_flag();

create table if not exists public.task_time_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author text not null default lower(coalesce(auth.jwt()->>'email','')),
  work_date date not null,
  minutes integer not null check (minutes between 1 and 1440),
  note text not null check (char_length(trim(note)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists task_time_logs_task_date on public.task_time_logs(task_id,work_date);
create index if not exists task_time_logs_date on public.task_time_logs(work_date);
alter table public.task_time_logs enable row level security;
revoke all on public.task_time_logs from anon, authenticated;
grant select,insert,delete on public.task_time_logs to authenticated;
grant update(work_date,minutes,note) on public.task_time_logs to authenticated;

create or replace function public.task_time_enabled(task uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.can_access_task(task) and coalesce((select p.time_tracking_enabled from public.projects p join public.tasks t on t.project_id=p.id where t.id=task),false);
$$;
revoke all on function public.task_time_enabled(uuid) from public, anon;
grant execute on function public.task_time_enabled(uuid) to authenticated;
drop policy if exists "time read" on public.task_time_logs;
create policy "time read" on public.task_time_logs for select to authenticated using (public.can_access_task(task_id));
drop policy if exists "time insert" on public.task_time_logs;
create policy "time insert" on public.task_time_logs for insert to authenticated with check (author=lower(coalesce(auth.jwt()->>'email','')) and public.task_time_enabled(task_id));
drop policy if exists "time update" on public.task_time_logs;
create policy "time update" on public.task_time_logs for update to authenticated using ((author=lower(coalesce(auth.jwt()->>'email','')) or public.is_admin()) and public.task_time_enabled(task_id)) with check (public.task_time_enabled(task_id));
drop policy if exists "time delete" on public.task_time_logs;
create policy "time delete" on public.task_time_logs for delete to authenticated using ((author=lower(coalesce(auth.jwt()->>'email','')) or public.is_admin()) and public.task_time_enabled(task_id));
commit;
