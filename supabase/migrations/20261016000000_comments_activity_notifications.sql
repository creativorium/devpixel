-- Task comments, task activity history, notifications and realtime. Safe to re-run.
-- Activity and notifications are written only by database triggers (security definer),
-- so members can read them but cannot forge them.

-- ---------------------------------------------------------------------------
-- Comments on tasks

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists task_comments_task on public.task_comments (task_id, created_at);

alter table public.task_comments enable row level security;
drop policy if exists "members read comments" on public.task_comments;
create policy "members read comments" on public.task_comments
  for select to authenticated using (public.is_member());
drop policy if exists "members comment as themselves" on public.task_comments;
create policy "members comment as themselves" on public.task_comments
  for insert to authenticated
  with check (public.is_member() and author = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "authors edit own comments" on public.task_comments;
create policy "authors edit own comments" on public.task_comments
  for update to authenticated
  using (author = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (author = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "authors or admins delete comments" on public.task_comments;
create policy "authors or admins delete comments" on public.task_comments
  for delete to authenticated
  using (author = lower(coalesce(auth.jwt() ->> 'email', '')) or public.is_admin());
revoke all on public.task_comments from anon;

-- ---------------------------------------------------------------------------
-- Activity history (trigger-written)

create table if not exists public.task_activity (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  actor text not null,
  kind text not null,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists task_activity_task on public.task_activity (task_id, created_at);

alter table public.task_activity enable row level security;
drop policy if exists "members read activity" on public.task_activity;
create policy "members read activity" on public.task_activity
  for select to authenticated using (public.is_member());
revoke all on public.task_activity from anon, authenticated;
grant select on public.task_activity to authenticated;

-- ---------------------------------------------------------------------------
-- Notifications (trigger-written; each member sees and clears only their own)

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  recipient text not null,
  actor text not null,
  kind text not null check (kind in ('mention', 'assigned', 'comment')),
  project_id uuid references public.projects (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  channel_id uuid references public.channels (id) on delete cascade,
  message_id uuid references public.messages (id) on delete cascade,
  preview text not null default '',
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_recipient on public.notifications (recipient, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists "recipients read notifications" on public.notifications;
create policy "recipients read notifications" on public.notifications
  for select to authenticated
  using (recipient = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "recipients mark notifications read" on public.notifications;
create policy "recipients mark notifications read" on public.notifications
  for update to authenticated
  using (recipient = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (recipient = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "recipients clear notifications" on public.notifications;
create policy "recipients clear notifications" on public.notifications
  for delete to authenticated
  using (recipient = lower(coalesce(auth.jwt() ->> 'email', '')));
revoke all on public.notifications from anon, authenticated;
grant select, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Team emails @mentioned in a text as @[Name](email).
create or replace function public.mentioned_members(body text)
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select distinct lower(m[1])
  from regexp_matches(coalesce(body, ''), '@\[[^\]]{1,80}\]\(([^()[:space:]]+@[^()[:space:]]+)\)', 'g') as m
  where exists (select 1 from public.members x where x.email = lower(m[1]));
$$;

create or replace function public.current_email()
returns text
language sql
stable
set search_path = ''
as $$ select lower(coalesce(auth.jwt() ->> 'email', 'system')) $$;

-- Tasks: activity + "assigned" and description @mention notifications.
create or replace function public.task_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  who text := public.current_email();
  added text[];
begin
  if tg_op = 'INSERT' then
    insert into public.task_activity (task_id, actor, kind, detail)
      values (new.id, who, 'created', jsonb_build_object('title', new.title));
    added := new.assignees;
  else
    if new.status is distinct from old.status then
      insert into public.task_activity (task_id, actor, kind, detail)
        values (new.id, who, 'status', jsonb_build_object('from', old.status, 'to', new.status));
    end if;
    if new.title is distinct from old.title then
      insert into public.task_activity (task_id, actor, kind, detail)
        values (new.id, who, 'title', jsonb_build_object('from', old.title, 'to', new.title));
    end if;
    if new.due_date is distinct from old.due_date then
      insert into public.task_activity (task_id, actor, kind, detail)
        values (new.id, who, 'due', jsonb_build_object('from', old.due_date, 'to', new.due_date));
    end if;
    if new.priority is distinct from old.priority then
      insert into public.task_activity (task_id, actor, kind, detail)
        values (new.id, who, 'priority', jsonb_build_object('from', old.priority, 'to', new.priority));
    end if;
    if new.labels is distinct from old.labels then
      insert into public.task_activity (task_id, actor, kind, detail)
        values (new.id, who, 'labels', jsonb_build_object('to', new.labels));
    end if;
    if new.assignees is distinct from old.assignees then
      insert into public.task_activity (task_id, actor, kind, detail)
        values (new.id, who, 'assignees', jsonb_build_object('to', new.assignees));
      select coalesce(array_agg(a), '{}') into added
        from unnest(new.assignees) a where a <> all (old.assignees);
    end if;
  end if;

  insert into public.notifications (recipient, actor, kind, project_id, task_id, preview)
    select a, who, 'assigned', new.project_id, new.id, left(new.title, 140)
    from unnest(coalesce(added, '{}')) a
    where a <> who;

  if tg_op = 'INSERT' or new.details is distinct from old.details then
    insert into public.notifications (recipient, actor, kind, project_id, task_id, preview)
      select m, who, 'mention', new.project_id, new.id, left(new.title, 140)
      from public.mentioned_members(new.details) m
      where m <> who
        and (tg_op = 'INSERT' or m not in (select public.mentioned_members(old.details)));
  end if;
  return new;
end;
$$;
drop trigger if exists tasks_events on public.tasks;
create trigger tasks_events after insert or update on public.tasks
  for each row execute function public.task_events();

-- Comments: activity, @mentions, and a heads-up to the task's assignees.
create or replace function public.comment_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  t record;
begin
  select id, project_id, title, assignees into t from public.tasks where id = new.task_id;
  insert into public.task_activity (task_id, actor, kind, detail)
    values (new.task_id, new.author, 'comment', jsonb_build_object('comment_id', new.id));
  insert into public.notifications (recipient, actor, kind, project_id, task_id, preview)
    select m, new.author, 'mention', t.project_id, t.id, left(new.body, 140)
    from public.mentioned_members(new.body) m
    where m <> new.author;
  insert into public.notifications (recipient, actor, kind, project_id, task_id, preview)
    select a, new.author, 'comment', t.project_id, t.id, left(new.body, 140)
    from unnest(coalesce(t.assignees, '{}')) a
    where a <> new.author
      and a not in (select public.mentioned_members(new.body));
  return new;
end;
$$;
drop trigger if exists task_comments_events on public.task_comments;
create trigger task_comments_events after insert on public.task_comments
  for each row execute function public.comment_events();

-- Chat: @mentions notify the person mentioned.
create or replace function public.message_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (recipient, actor, kind, channel_id, message_id, preview)
    select m, new.author, 'mention', new.channel_id, new.id, left(new.body, 140)
    from public.mentioned_members(new.body) m
    where m <> new.author;
  return new;
end;
$$;
drop trigger if exists messages_events on public.messages;
create trigger messages_events after insert on public.messages
  for each row execute function public.message_events();

revoke all on function public.task_events(), public.comment_events(), public.message_events() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: stream new chat messages and notifications to open browsers.
-- Realtime applies the same row level security, so people only receive rows they can read.

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
