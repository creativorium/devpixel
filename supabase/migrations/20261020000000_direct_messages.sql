-- Private one-to-one chats. Apply after migration 19. Safe to rerun.
begin;
alter table public.channels add column if not exists direct_members text[];
create unique index if not exists channels_direct_pair on public.channels(direct_members) where direct_members is not null;

create or replace function public._member_resource_access(kind text, resource_id uuid, member_email text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare allowed text[]; member_role text; parent_id uuid; participants text[];
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
    select visible_to, direct_members into allowed, participants from public.channels where id = resource_id;
    if participants is not null then return coalesce(member_email = any(participants), false); end if;
  else return false;
  end if;
  if not found then return false; end if;
  return member_role = 'admin' or allowed is null or coalesce(member_email = any(allowed), false);
end;
$$;
revoke all on function public._member_resource_access(text, uuid, text) from public, anon, authenticated;

create or replace function public.guard_direct_channel()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.direct_members is not null and current_user in ('authenticated','anon') then
      raise exception 'Use start_direct_message to create a private chat.';
    end if;
  elsif old.direct_members is not null or new.direct_members is not null then
    raise exception 'Direct message participants and settings cannot be changed.';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_direct_channel on public.channels;
create trigger guard_direct_channel before insert or update on public.channels
for each row execute function public.guard_direct_channel();

-- Unrelated workspace admins cannot read DMs either.
drop policy if exists "direct participants" on public.channels;
create policy "direct participants" on public.channels as restrictive for select to authenticated
using (direct_members is null or lower(coalesce(auth.jwt()->>'email','')) = any(direct_members));
drop policy if exists "direct immutable update" on public.channels;
create policy "direct immutable update" on public.channels as restrictive for update to authenticated
using (direct_members is null) with check (direct_members is null);
drop policy if exists "direct immutable delete" on public.channels;
create policy "direct immutable delete" on public.channels as restrictive for delete to authenticated
using (direct_members is null);

create or replace function public.start_direct_message(other_email text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare who text := lower(coalesce(auth.jwt()->>'email','')); pair text[]; result uuid;
begin
  other_email := lower(trim(other_email));
  if not public.is_member() or other_email is null or other_email = who or not exists(select 1 from public.members where email=other_email) then
    raise exception 'Choose another team member.';
  end if;
  select array_agg(e order by e) into pair from unnest(array[who,other_email]) e;
  perform pg_advisory_xact_lock(hashtextextended(pair::text,0));
  select id into result from public.channels where direct_members=pair;
  if result is null then
    insert into public.channels(name,direct_members) values ('dm-'||replace(gen_random_uuid()::text,'-',''),pair) returning id into result;
  end if;
  return result;
end;
$$;
revoke all on function public.start_direct_message(text) from public, anon;
grant execute on function public.start_direct_message(text) to authenticated;

alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in ('mention','assigned','comment','direct'));
create or replace function public.message_events()
returns trigger language plpgsql security definer set search_path = '' as $$
declare participants text[];
begin
  select direct_members into participants from public.channels where id=new.channel_id;
  if participants is not null then
    insert into public.notifications(recipient,actor,kind,channel_id,message_id,preview)
    select e,new.author,'direct',new.channel_id,new.id,left(new.body,140) from unnest(participants) e where e<>new.author;
  else
    insert into public.notifications(recipient,actor,kind,channel_id,message_id,preview)
    select m,new.author,'mention',new.channel_id,new.id,left(new.body,140) from public.mentioned_members(new.body) m where m<>new.author;
  end if;
  return new;
end;
$$;
commit;
