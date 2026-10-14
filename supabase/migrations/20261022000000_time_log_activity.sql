-- Time-log activity and accurate card totals. Apply after migration 21; safe to rerun.
begin;
create or replace function public.time_log_activity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare entry public.task_time_logs; event_kind text;
begin
  if tg_op='DELETE' then entry := old; event_kind := 'time_deleted';
  elsif tg_op='UPDATE' then
    if (new.minutes,new.work_date,new.note) is not distinct from (old.minutes,old.work_date,old.note) then return new; end if;
    entry := new; event_kind := 'time_updated';
  else entry := new; event_kind := 'time_logged'; end if;
  -- A cascading task deletion has no surviving task to attach history to.
  if exists(select 1 from public.tasks where id=entry.task_id) then
    insert into public.task_activity(task_id,actor,kind,detail)
    values(entry.task_id,lower(coalesce(auth.jwt()->>'email','')),event_kind,
      jsonb_build_object('log_id',entry.id,'minutes',entry.minutes,'work_date',entry.work_date,'note',entry.note,'author',entry.author));
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.time_log_activity() from public, anon, authenticated;
drop trigger if exists time_log_activity on public.task_time_logs;
create trigger time_log_activity after insert or update or delete on public.task_time_logs
for each row execute function public.time_log_activity();

-- Include logs saved before this migration, once only.
insert into public.task_activity(task_id,actor,kind,detail,created_at)
select l.task_id,l.author,'time_logged',jsonb_build_object('log_id',l.id,'minutes',l.minutes,'work_date',l.work_date,'note',l.note,'author',l.author),l.created_at
from public.task_time_logs l where not exists (
  select 1 from public.task_activity a where a.kind='time_logged' and a.detail->>'log_id'=l.id::text
);

create or replace function public.project_time_totals(project uuid)
returns table(task_id uuid, minutes bigint) language sql stable security invoker set search_path = '' as $$
  select l.task_id,sum(l.minutes) from public.task_time_logs l join public.tasks t on t.id=l.task_id
  where t.project_id=project group by l.task_id;
$$;
revoke all on function public.project_time_totals(uuid) from public, anon;
grant execute on function public.project_time_totals(uuid) to authenticated;
commit;
