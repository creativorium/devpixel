-- Private conversations with 2–5 members, including the caller. Safe to rerun.
begin;
create or replace function public.start_private_conversation(other_emails text[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare who text := lower(coalesce(auth.jwt()->>'email','')); participants text[]; result uuid;
begin
  if not public.is_member() or other_emails is null or cardinality(other_emails)>4 then
    raise exception 'Choose one to four teammates (five people including you).';
  end if;
  if exists(select 1 from unnest(other_emails) e where e is null or not exists(select 1 from public.members m where m.email=lower(trim(e)))) then
    raise exception 'Choose existing team members.';
  end if;
  select array_agg(e order by e) into participants from (select distinct lower(trim(x)) e from unnest(other_emails || array[who]) x) entries;
  if cardinality(participants)<2 or cardinality(participants)>5 then raise exception 'Conversations need two to five people.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(participants::text,0));
  select id into result from public.channels where direct_members=participants;
  if result is null then
    insert into public.channels(name,direct_members) values ('dm-'||replace(gen_random_uuid()::text,'-',''),participants) returning id into result;
  end if;
  return result;
end;
$$;
revoke all on function public.start_private_conversation(text[]) from public, anon;
grant execute on function public.start_private_conversation(text[]) to authenticated;
commit;
