-- File attachments for tasks and chat (screenshots, PDFs, documents).
-- Files live in a PRIVATE storage bucket and are served through the site after the
-- same team check, so a leaked link is useless to anyone outside the team. Safe to re-run.

insert into storage.buckets (id, name, public, file_size_limit)
values ('workspace', 'workspace', false, 4194304)
on conflict (id) do update set public = false, file_size_limit = 4194304;

drop policy if exists "members read workspace files" on storage.objects;
create policy "members read workspace files" on storage.objects
  for select to authenticated
  using (bucket_id = 'workspace' and public.is_member());

drop policy if exists "members upload workspace files" on storage.objects;
create policy "members upload workspace files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'workspace' and public.is_member());

drop policy if exists "members delete workspace files" on storage.objects;
create policy "members delete workspace files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'workspace' and public.is_member());

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  name text not null check (char_length(name) between 1 and 200),
  mime text not null check (char_length(mime) <= 100),
  size integer not null check (size between 1 and 4194304),
  task_id uuid references public.tasks (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete cascade,
  message_id uuid references public.messages (id) on delete cascade,
  uploaded_by text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  created_at timestamptz not null default now(),
  check (task_id is not null or channel_id is not null)
);
create index if not exists attachments_task on public.attachments (task_id);
create index if not exists attachments_message on public.attachments (message_id);

alter table public.attachments enable row level security;

drop policy if exists "members read attachments" on public.attachments;
create policy "members read attachments" on public.attachments
  for select to authenticated using (public.is_member());

drop policy if exists "members add attachments as themselves" on public.attachments;
create policy "members add attachments as themselves" on public.attachments
  for insert to authenticated
  with check (public.is_member() and uploaded_by = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Linking a chat upload to the message it was sent with: uploader only.
drop policy if exists "uploaders link attachments" on public.attachments;
create policy "uploaders link attachments" on public.attachments
  for update to authenticated
  using (public.is_member() and uploaded_by = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (uploaded_by = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "members remove attachments" on public.attachments;
create policy "members remove attachments" on public.attachments
  for delete to authenticated using (public.is_member());

revoke all on public.attachments from anon;

-- ---------------------------------------------------------------------------
-- Labels, subtasks and multiple assignees on tasks.

alter table public.tasks
  add column if not exists labels text[] not null default '{}',
  add column if not exists parent_id uuid references public.tasks (id) on delete cascade,
  add column if not exists assignees text[] not null default '{}';

alter table public.tasks drop constraint if exists tasks_labels_known;
alter table public.tasks add constraint tasks_labels_known check (
  labels <@ array['bug', 'blocker', 'feature', 'improvement', 'design', 'content', 'client']::text[]
);
alter table public.tasks drop constraint if exists tasks_assignees_limit;
alter table public.tasks add constraint tasks_assignees_limit check (cardinality(assignees) <= 5);
alter table public.tasks drop constraint if exists tasks_not_own_parent;
alter table public.tasks add constraint tasks_not_own_parent check (parent_id is distinct from id);
create index if not exists tasks_parent on public.tasks (parent_id);
create index if not exists tasks_assignees on public.tasks using gin (assignees);

-- Carry existing single assignees over to the new list.
update public.tasks set assignees = array[assignee]
  where assignee is not null and cardinality(assignees) = 0;

-- ---------------------------------------------------------------------------
-- Linked tasks: a task "blocked by" another cannot leave To do until it is done.

create table if not exists public.task_dependencies (
  task_id uuid not null,
  blocked_by uuid not null,
  created_by text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  created_at timestamptz not null default now(),
  primary key (task_id, blocked_by),
  constraint task_dependencies_task_fk foreign key (task_id) references public.tasks (id) on delete cascade,
  constraint task_dependencies_blocker_fk foreign key (blocked_by) references public.tasks (id) on delete cascade,
  constraint task_dependencies_not_self check (task_id <> blocked_by)
);
create index if not exists task_dependencies_blocker on public.task_dependencies (blocked_by);

alter table public.task_dependencies enable row level security;
drop policy if exists "members manage dependencies" on public.task_dependencies;
create policy "members manage dependencies" on public.task_dependencies
  for all to authenticated using (public.is_member()) with check (public.is_member());
revoke all on public.task_dependencies from anon;

-- Refuse links that would create a loop (A waits for B, B waits for A).
create or replace function public.prevent_dependency_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    with recursive chain(id) as (
      select new.blocked_by
      union
      select d.blocked_by from public.task_dependencies d join chain c on d.task_id = c.id
    )
    select 1 from chain where id = new.task_id
  ) then
    raise exception 'These tasks would block each other.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists task_dependencies_no_cycle on public.task_dependencies;
create trigger task_dependencies_no_cycle before insert or update on public.task_dependencies
  for each row execute function public.prevent_dependency_cycle();

-- Enforce the rule on every status change, whatever the client does.
create or replace function public.enforce_dependencies()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'todo' and new.status is distinct from old.status and exists (
    select 1
    from public.task_dependencies d
    join public.tasks b on b.id = d.blocked_by
    where d.task_id = new.id and b.status <> 'done'
  ) then
    raise exception 'Blocked by unfinished tasks.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists tasks_dependencies on public.tasks;
create trigger tasks_dependencies before update of status on public.tasks
  for each row execute function public.enforce_dependencies();

-- ---------------------------------------------------------------------------
-- Roles: admins manage channels; members do everything else.
-- Members cannot change roles (only display_name is updatable by members).

alter table public.members add column if not exists role text not null default 'member';
alter table public.members drop constraint if exists members_role_known;
alter table public.members add constraint members_role_known check (role in ('admin', 'member'));
update public.members set role = 'admin' where email = 'abetnego.kristiawan@gmail.com';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members m
    where m.email = lower(coalesce(auth.jwt() ->> 'email', '')) and m.role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "members manage channels" on public.channels;
drop policy if exists "members read channels" on public.channels;
create policy "members read channels" on public.channels
  for select to authenticated using (public.is_member());
drop policy if exists "admins create channels" on public.channels;
create policy "admins create channels" on public.channels
  for insert to authenticated with check (public.is_admin());
drop policy if exists "admins edit channels" on public.channels;
create policy "admins edit channels" on public.channels
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins delete channels" on public.channels;
create policy "admins delete channels" on public.channels
  for delete to authenticated using (public.is_admin());
