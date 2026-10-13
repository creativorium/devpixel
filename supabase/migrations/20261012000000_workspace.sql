-- DevnPixel Teams workspace: projects, kanban tasks and shared notes.
-- Run once in Supabase → SQL Editor. Safe to re-run: it only creates what is missing.
-- Access is limited to emails in public.members; manage that list from the SQL editor.

create table if not exists public.members (
  email text primary key check (email = lower(email) and email like '%_@_%'),
  display_name text not null default '' check (char_length(display_name) <= 80),
  added_at timestamptz not null default now()
);

-- True when the signed-in user's email is on the team allowlist.
create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.members m
    where m.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_member() from public, anon;
grant execute on function public.is_member() to authenticated;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  created_by text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  details text not null default '' check (char_length(details) <= 10000),
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee text references public.members (email) on update cascade on delete set null,
  due_date date,
  position double precision not null default 0,
  created_by text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_project_status_position
  on public.tasks (project_id, status, position);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 100000),
  created_by text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  updated_by text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notes_project_updated on public.notes (project_id, updated_at desc);

-- Keeps updated_at / updated_by honest regardless of what the client sends.
create or replace function public.touch_row()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_table_name = 'notes' then
    new.updated_by := lower(coalesce(auth.jwt() ->> 'email', new.updated_by));
  end if;
  return new;
end;
$$;
drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch before update on public.tasks
  for each row execute function public.touch_row();
drop trigger if exists notes_touch on public.notes;
create trigger notes_touch before update on public.notes
  for each row execute function public.touch_row();

-- Row level security: only allowlisted members can read or change anything.
alter table public.members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;

drop policy if exists "members read team" on public.members;
create policy "members read team" on public.members
  for select to authenticated using (public.is_member());

drop policy if exists "members manage projects" on public.projects;
create policy "members manage projects" on public.projects
  for all to authenticated using (public.is_member()) with check (public.is_member());

drop policy if exists "members manage tasks" on public.tasks;
create policy "members manage tasks" on public.tasks
  for all to authenticated using (public.is_member()) with check (public.is_member());

drop policy if exists "members manage notes" on public.notes;
create policy "members manage notes" on public.notes
  for all to authenticated using (public.is_member()) with check (public.is_member());

revoke all on public.members, public.projects, public.tasks, public.notes from anon;

-- Add your team (lowercase emails, up to five people), then re-run just this block when it changes:
-- insert into public.members (email, display_name) values
--   ('you@devnpixel.com', 'Your Name'),
--   ('teammate@devnpixel.com', 'Teammate')
-- on conflict (email) do update set display_name = excluded.display_name;
