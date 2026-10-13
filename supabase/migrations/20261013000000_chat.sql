-- DevnPixel Teams chat: Slack-style channels and messages.
-- Requires 20261012000000_workspace.sql (members, is_member, touch_row). Safe to re-run.

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name ~ '^[a-z0-9][a-z0-9-]{0,39}$'),
  topic text not null default '' check (char_length(topic) <= 200),
  created_by text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  author text not null default lower(coalesce(auth.jwt() ->> 'email', '')),
  body text not null check (char_length(body) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists messages_channel_created on public.messages (channel_id, created_at desc);
create index if not exists messages_channel_updated on public.messages (channel_id, updated_at);

drop trigger if exists messages_touch on public.messages;
create trigger messages_touch before update on public.messages
  for each row execute function public.touch_row();

alter table public.channels enable row level security;
alter table public.messages enable row level security;

drop policy if exists "members manage channels" on public.channels;
create policy "members manage channels" on public.channels
  for all to authenticated using (public.is_member()) with check (public.is_member());

drop policy if exists "members read messages" on public.messages;
create policy "members read messages" on public.messages
  for select to authenticated using (public.is_member());

-- Post only as yourself; edit or delete only your own messages.
drop policy if exists "members post as themselves" on public.messages;
create policy "members post as themselves" on public.messages
  for insert to authenticated
  with check (public.is_member() and author = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "authors edit own messages" on public.messages;
create policy "authors edit own messages" on public.messages
  for update to authenticated
  using (public.is_member() and author = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (author = lower(coalesce(auth.jwt() ->> 'email', '')));

revoke all on public.channels, public.messages from anon;

insert into public.channels (name, topic, created_by)
values ('general', 'Team-wide announcements and chat', 'system')
on conflict (name) do nothing;
