-- Project-specific column names/colors and extra open stages. Existing status
-- IDs remain stable so completion timestamps and dependency rules still work.
begin;
alter table public.projects add column if not exists statuses jsonb not null default
  '[{"id":"todo","label":"To do","color":"#e87ba4"},{"id":"in_progress","label":"In progress","color":"#2a78d6"},{"id":"review","label":"Review","color":"#eda100"},{"id":"done","label":"Done","color":"#1baf7a"}]'::jsonb;

create or replace function public.valid_project_statuses(value jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb; ids text[] := '{}'; names text[] := '{}';
begin
  if jsonb_typeof(value) <> 'array' then return false; end if;
  if jsonb_array_length(value) not between 4 and 20 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) <> 'object'
      or jsonb_typeof(item->'id') is distinct from 'string'
      or jsonb_typeof(item->'label') is distinct from 'string'
      or jsonb_typeof(item->'color') is distinct from 'string' then return false; end if;
    if (item->>'id') !~ '^(todo|in_progress|review|done|custom_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$'
      or char_length(btrim(item->>'label')) not between 1 and 40
      or (item->>'color') !~ '^#[0-9a-fA-F]{6}$'
      or (item->>'id') = any(ids)
      or lower(btrim(item->>'label')) = any(names) then return false; end if;
    ids := array_append(ids, item->>'id');
    names := array_append(names, lower(btrim(item->>'label')));
  end loop;
  return ids @> array['todo','in_progress','review','done'];
end;
$$;
alter table public.projects drop constraint if exists projects_statuses_valid;
alter table public.projects add constraint projects_statuses_valid check (public.valid_project_statuses(statuses));

-- Enforce membership of a status in this specific project on every write.
create or replace function public.check_task_project_status()
returns trigger language plpgsql set search_path = '' as $$
declare options jsonb;
begin
  select statuses into options from public.projects where id = new.project_id for share;
  if options is null or not exists (select 1 from jsonb_array_elements(options) s where s->>'id' = new.status) then
    raise exception 'Unknown project status';
  end if;
  return new;
end;
$$;
drop trigger if exists tasks_project_status on public.tasks;
create trigger tasks_project_status before insert or update of status, project_id on public.tasks
for each row execute function public.check_task_project_status();
alter table public.tasks drop constraint if exists tasks_status_check;

-- Do not orphan cards if a client edits the project configuration directly.
create or replace function public.keep_used_project_statuses()
returns trigger language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.tasks t where t.project_id = new.id
    and not exists (select 1 from jsonb_array_elements(new.statuses) s where s->>'id' = t.status)) then
    raise exception 'Cannot remove a status that contains tasks';
  end if;
  return new;
end;
$$;
drop trigger if exists projects_keep_used_statuses on public.projects;
create trigger projects_keep_used_statuses before update of statuses on public.projects
for each row execute function public.keep_used_project_statuses();

-- Lock the project row: concurrent additions/renames cannot overwrite each other.
-- SECURITY INVOKER preserves the existing member-only project RLS policies.
create or replace function public.save_project_status(p_project_id uuid, p_status_id text, p_label text, p_color text)
returns void language plpgsql security invoker set search_path = '' as $$
declare options jsonb; updated jsonb; item jsonb; new_id text;
begin
  if not public.is_member() then raise exception 'Team membership required'; end if;
  select statuses into options from public.projects where id = p_project_id for update;
  if options is null then raise exception 'Unknown project status'; end if;
  if p_label is null or char_length(btrim(p_label)) not between 1 and 40 or p_color is null or p_color !~ '^#[0-9a-fA-F]{6}$' then
    raise exception 'Invalid status';
  end if;
  if exists (select 1 from jsonb_array_elements(options) s where lower(btrim(s->>'label')) = lower(btrim(p_label)) and (p_status_id is null or s->>'id' <> p_status_id)) then
    raise exception 'A status with this name already exists';
  end if;
  if p_status_id is null then
    if jsonb_array_length(options) >= 20 then raise exception 'Maximum 20 statuses per project'; end if;
    new_id := 'custom_' || gen_random_uuid()::text;
    item := jsonb_build_object('id',new_id,'label',btrim(p_label),'color',p_color);
    select jsonb_agg(s order by ord) into updated from (
      select value as s, ordinality * 2 as ord from jsonb_array_elements(options) with ordinality
      union all select item, ordinality * 2 - 1 from jsonb_array_elements(options) with ordinality where value->>'id' = 'done'
    ) entries;
  else
    if not exists (select 1 from jsonb_array_elements(options) s where s->>'id' = p_status_id) then raise exception 'Unknown project status'; end if;
    select jsonb_agg(case when value->>'id' = p_status_id then value || jsonb_build_object('label',btrim(p_label),'color',p_color) else value end order by ordinality)
      into updated from jsonb_array_elements(options) with ordinality;
  end if;
  update public.projects set statuses = updated where id = p_project_id;
end;
$$;
revoke all on function public.save_project_status(uuid,text,text,text) from public, anon;
grant execute on function public.save_project_status(uuid,text,text,text) to authenticated;
revoke all on function public.check_task_project_status(), public.keep_used_project_statuses() from public, anon, authenticated;
commit;
