-- Admin-managed team allowlist. Does not send mail or modify Supabase Auth users.
begin;
create or replace function public.admin_save_member(member_email text, member_name text, member_role text, create_member boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare who text := lower(coalesce(auth.jwt()->>'email','')); old_role text;
begin
  -- Serialize role changes so two admins cannot concurrently remove the last admin.
  lock table public.members in share row exclusive mode;
  if not public.is_admin() then raise exception 'Only admins can manage team members.'; end if;
  member_email:=lower(trim(member_email)); member_name:=trim(member_name);
  if member_email is null or char_length(member_email)>254 or member_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or member_name is null or char_length(member_name) not between 1 and 80
    or member_role is null or member_role not in ('admin','member') or create_member is null then raise exception 'Enter a valid email, name and role.'; end if;
  select role into old_role from public.members where email=member_email;
  if create_member then
    if old_role is not null then raise exception 'This email is already on the team.'; end if;
    insert into public.members(email,display_name,role) values(member_email,member_name,member_role);
  else
    if old_role is null then raise exception 'Member not found.'; end if;
    if member_email=who and member_role<>'admin' then raise exception 'You cannot remove your own admin role.'; end if;
    if old_role='admin' and member_role<>'admin' and (select count(*) from public.members where role='admin')<=1 then raise exception 'Keep at least one admin.'; end if;
    update public.members set display_name=member_name,role=member_role where email=member_email;
  end if;
  return true;
end;
$$;
revoke all on function public.admin_save_member(text,text,text,boolean) from public,anon;
grant execute on function public.admin_save_member(text,text,text,boolean) to authenticated;
commit;
