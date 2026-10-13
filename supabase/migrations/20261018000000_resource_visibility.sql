-- Admin-managed project and channel access. NULL means everyone; {} means admins only.
-- Apply after 20261017000000_project_statuses.sql. Safe to re-run.
begin;
alter table public.projects add column if not exists visible_to text[];
alter table public.channels add column if not exists visible_to text[];

-- Private helper also used by notification triggers. Never expose arbitrary-email checks as RPCs.
create or replace function public._member_resource_access(kind text, resource_id uuid, member_email text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare allowed text[]; member_role text; parent_id uuid;
begin
  select role into member_role from public.members where email = member_email;
  if member_role is null or resource_id is null then return false; end if;
  if kind = 'task' then
    select project_id into parent_id from public.tasks where id = resource_id;
    return public._member_resource_access('project', parent_id, member_email);
  elsif kind = 'message' then
    select channel_id into parent_id from public.messages where id = resource_id;
    return public._member_resource_access('channel', parent_id, member_email);
  elsif kind = 'project' then
    select visible_to into allowed from public.projects where id = resource_id;
  elsif kind = 'channel' then
    select visible_to into allowed from public.channels where id = resource_id;
  else return false;
  end if;
  if not found then return false; end if;
  return member_role = 'admin' or allowed is null or coalesce(member_email = any(allowed), false);
end;
$$;
revoke all on function public._member_resource_access(text, uuid, text) from public, anon, authenticated;

create or replace function public.can_access_project(resource_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public._member_resource_access('project', resource_id, lower(coalesce(auth.jwt()->>'email', '')));
$$;
revoke all on function public.can_access_project(uuid) from public, anon;
grant execute on function public.can_access_project(uuid) to authenticated;

create or replace function public.can_access_channel(resource_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public._member_resource_access('channel', resource_id, lower(coalesce(auth.jwt()->>'email', '')));
$$;
revoke all on function public.can_access_channel(uuid) from public, anon;
grant execute on function public.can_access_channel(uuid) to authenticated;

create or replace function public.can_access_task(resource_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public._member_resource_access('task', resource_id, lower(coalesce(auth.jwt()->>'email', '')));
$$;
revoke all on function public.can_access_task(uuid) from public, anon;
grant execute on function public.can_access_task(uuid) to authenticated;

create or replace function public.can_access_message(resource_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public._member_resource_access('message', resource_id, lower(coalesce(auth.jwt()->>'email', '')));
$$;
revoke all on function public.can_access_message(uuid) from public, anon;
grant execute on function public.can_access_message(uuid) to authenticated;

create or replace function public.guard_resource_visibility()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    if (tg_op = 'INSERT' and new.visible_to is not null)
      or (tg_op = 'UPDATE' and new.visible_to is distinct from old.visible_to) then
      raise exception 'Only admins can change visibility.' using errcode = '42501';
    end if;
    if tg_table_name = 'projects' then
      if (tg_op = 'INSERT' and new.archived_at is not null)
        or (tg_op = 'UPDATE' and new.archived_at is distinct from old.archived_at) then
        raise exception 'Only admins can archive projects.' using errcode = '42501';
      end if;
    end if;
  end if;
  if new.visible_to is not null and (tg_op = 'INSERT' or new.visible_to is distinct from old.visible_to) then
    if cardinality(new.visible_to) > 100 or exists (
      select 1 from unnest(new.visible_to) e
      where e is null or not exists (select 1 from public.members m where m.email = e)
    ) then raise exception 'Select existing team members.' using errcode = '22023'; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.guard_resource_visibility() from public, anon, authenticated;
drop trigger if exists guard_visibility on public.projects;
create trigger guard_visibility before insert or update on public.projects
for each row execute function public.guard_resource_visibility();
drop policy if exists "visibility select" on public.projects;
create policy "visibility select" on public.projects as restrictive for select to authenticated using (public.is_member() and (public.is_admin() or visible_to is null or lower(coalesce(auth.jwt()->>'email', '')) = any(visible_to)));
drop policy if exists "visibility update" on public.projects;
create policy "visibility update" on public.projects as restrictive for update to authenticated using (public.is_member() and (public.is_admin() or visible_to is null or lower(coalesce(auth.jwt()->>'email', '')) = any(visible_to))) with check (public.is_member() and (public.is_admin() or visible_to is null or lower(coalesce(auth.jwt()->>'email', '')) = any(visible_to)));
drop policy if exists "visibility delete" on public.projects;
create policy "visibility delete" on public.projects as restrictive for delete to authenticated using (public.is_member() and (public.is_admin() or visible_to is null or lower(coalesce(auth.jwt()->>'email', '')) = any(visible_to)) and public.is_admin());
drop trigger if exists guard_visibility on public.channels;
create trigger guard_visibility before insert or update on public.channels
for each row execute function public.guard_resource_visibility();
drop policy if exists "visibility select" on public.channels;
create policy "visibility select" on public.channels as restrictive for select to authenticated using (public.is_member() and (public.is_admin() or visible_to is null or lower(coalesce(auth.jwt()->>'email', '')) = any(visible_to)));
drop policy if exists "visibility update" on public.channels;
create policy "visibility update" on public.channels as restrictive for update to authenticated using (public.is_member() and (public.is_admin() or visible_to is null or lower(coalesce(auth.jwt()->>'email', '')) = any(visible_to))) with check (public.is_member() and (public.is_admin() or visible_to is null or lower(coalesce(auth.jwt()->>'email', '')) = any(visible_to)));
drop policy if exists "visibility delete" on public.channels;
create policy "visibility delete" on public.channels as restrictive for delete to authenticated using (public.is_member() and (public.is_admin() or visible_to is null or lower(coalesce(auth.jwt()->>'email', '')) = any(visible_to)));

drop policy if exists "resource visibility" on public.tasks;
create policy "resource visibility" on public.tasks as restrictive for all to authenticated
using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

drop policy if exists "resource visibility" on public.notes;
create policy "resource visibility" on public.notes as restrictive for all to authenticated
using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

drop policy if exists "resource visibility" on public.messages;
create policy "resource visibility" on public.messages as restrictive for all to authenticated
using (public.can_access_channel(channel_id)) with check (public.can_access_channel(channel_id));

drop policy if exists "resource visibility" on public.task_comments;
create policy "resource visibility" on public.task_comments as restrictive for all to authenticated
using (public.can_access_task(task_id)) with check (public.can_access_task(task_id));

drop policy if exists "resource visibility" on public.task_activity;
create policy "resource visibility" on public.task_activity as restrictive for all to authenticated
using (public.can_access_task(task_id)) with check (public.can_access_task(task_id));

drop policy if exists "resource visibility" on public.task_dependencies;
create policy "resource visibility" on public.task_dependencies as restrictive for all to authenticated
using (public.can_access_task(task_id) and public.can_access_task(blocked_by)) with check (public.can_access_task(task_id) and public.can_access_task(blocked_by));

drop policy if exists "resource visibility" on public.notifications;
create policy "resource visibility" on public.notifications as restrictive for all to authenticated
using ((project_id is not null or task_id is not null or channel_id is not null or message_id is not null)
and (project_id is null or public.can_access_project(project_id))
and (task_id is null or public.can_access_task(task_id))
and (channel_id is null or public.can_access_channel(channel_id))
and (message_id is null or public.can_access_message(message_id))) with check ((project_id is not null or task_id is not null or channel_id is not null or message_id is not null)
and (project_id is null or public.can_access_project(project_id))
and (task_id is null or public.can_access_task(task_id))
and (channel_id is null or public.can_access_channel(channel_id))
and (message_id is null or public.can_access_message(message_id)));

drop policy if exists "resource visibility" on public.attachments;
create policy "resource visibility" on public.attachments as restrictive for all to authenticated
using ((task_id is null or public.can_access_task(task_id))
and (channel_id is null or public.can_access_channel(channel_id))
and (message_id is null or public.can_access_message(message_id))
and ((task_id is not null and path like 'tasks/' || task_id::text || '/%')
  or (channel_id is not null and path like 'channels/' || channel_id::text || '/%'))) with check ((task_id is null or public.can_access_task(task_id))
and (channel_id is null or public.can_access_channel(channel_id))
and (message_id is null or public.can_access_message(message_id))
and ((task_id is not null and path like 'tasks/' || task_id::text || '/%')
  or (channel_id is not null and path like 'channels/' || channel_id::text || '/%')));

-- Storage upload happens before the attachment row, so authorize the target in its path.
create or replace function public.can_access_workspace_path(object_name text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare resource_id uuid; folder text;
begin
  folder := split_part(object_name, '/', 1);
  if folder not in ('tasks', 'channels') or split_part(object_name, '/', 3) = '' then return false; end if;
  begin resource_id := split_part(object_name, '/', 2)::uuid;
  exception when invalid_text_representation then return false; end;
  if folder = 'tasks' then return public.can_access_task(resource_id); end if;
  return public.can_access_channel(resource_id);
end;
$$;
revoke all on function public.can_access_workspace_path(text) from public, anon;
grant execute on function public.can_access_workspace_path(text) to authenticated;
drop policy if exists "workspace resource visibility" on storage.objects;
create policy "workspace resource visibility" on storage.objects as restrictive for all to authenticated
using (bucket_id <> 'workspace' or public.can_access_workspace_path(name))
with check (bucket_id <> 'workspace' or public.can_access_workspace_path(name));

-- Existing event triggers bypass RLS; prevent them notifying excluded recipients.
create or replace function public.guard_notification_visibility()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (new.project_id is not null and not public._member_resource_access('project', new.project_id, new.recipient))
    or (new.task_id is not null and not public._member_resource_access('task', new.task_id, new.recipient))
    or (new.channel_id is not null and not public._member_resource_access('channel', new.channel_id, new.recipient))
    or (new.message_id is not null and not public._member_resource_access('message', new.message_id, new.recipient))
  then return null; end if;
  return new;
end;
$$;
revoke all on function public.guard_notification_visibility() from public, anon, authenticated;
drop trigger if exists notification_visibility on public.notifications;
create trigger notification_visibility before insert on public.notifications
for each row execute function public.guard_notification_visibility();
commit;
