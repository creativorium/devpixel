-- Existing private conversations can grow to five members. Safe to rerun.
begin;
drop index if exists public.channels_direct_pair;
create unique index if not exists channels_direct_pair on public.channels(direct_members) where cardinality(direct_members)=2;
create or replace function public.guard_direct_channel()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated','anon') then
    if tg_op='INSERT' and new.direct_members is not null then raise exception 'Use the private conversation functions.';
    elsif tg_op='UPDATE' and (old.direct_members is not null or new.direct_members is not null) then raise exception 'Use the private conversation functions.'; end if;
  end if;
  return new;
end;
$$;
create or replace function public.add_conversation_members(conversation uuid, emails text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare who text:=lower(coalesce(auth.jwt()->>'email','')); existing text[]; combined text[];
begin
  select direct_members into existing from public.channels where id=conversation for update;
  if not public.is_member() or existing is null or not (who=any(existing)) then raise exception 'Conversation not available.'; end if;
  if emails is null or cardinality(emails)<1 or cardinality(emails)>4 or exists(select 1 from unnest(emails) e where e is null or not exists(select 1 from public.members m where m.email=lower(trim(e)))) then raise exception 'Choose existing teammates.'; end if;
  select array_agg(e order by e) into combined from (select distinct lower(trim(x)) e from unnest(existing||emails) x) p;
  if cardinality(combined)>5 then raise exception 'A conversation can have at most five people.'; end if;
  update public.channels set direct_members=combined where id=conversation;
  return conversation;
end;
$$;
revoke all on function public.add_conversation_members(uuid,text[]) from public,anon;
grant execute on function public.add_conversation_members(uuid,text[]) to authenticated;
create or replace function public.delete_private_conversation(conversation uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
declare participants text[];
begin
  select direct_members into participants from public.channels where id=conversation for update;
  if not public.is_member() or participants is null or not (lower(coalesce(auth.jwt()->>'email',''))=any(participants)) then raise exception 'Conversation not available.'; end if;
  delete from public.channels where id=conversation;
  return true;
end;
$$;
revoke all on function public.delete_private_conversation(uuid) from public,anon;
grant execute on function public.delete_private_conversation(uuid) to authenticated;
commit;
