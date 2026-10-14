-- Private admin billing profiles and invoice/task register. No public invoice content here.
begin;
create table if not exists public.project_billing (
  project_id uuid primary key references public.projects(id) on delete cascade,
  details jsonb not null default '{}' check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 20000)
);
create table if not exists public.project_invoices (
  id uuid primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  share_id text not null unique check (share_id ~ '^[A-Za-z0-9_-]{24}$'),
  invoice_number text not null,
  fingerprint text not null,
  task_ids uuid[] not null check (cardinality(task_ids) between 1 and 500),
  state text not null default 'pending' check (state in ('pending','saved','uncertain')),
  repeat_approved boolean not null default false,
  created_by text not null default lower(coalesce(auth.jwt()->>'email','')),
  created_at timestamptz not null default now()
);
alter table public.project_invoices add column if not exists repeat_approved boolean not null default false;
create index if not exists project_invoices_project on public.project_invoices(project_id,created_at desc);
alter table public.project_billing enable row level security;
alter table public.project_invoices enable row level security;
revoke all on public.project_billing, public.project_invoices from anon, authenticated;
grant select, insert, update on public.project_billing, public.project_invoices to authenticated;
revoke update on public.project_invoices from authenticated;
grant update(state) on public.project_invoices to authenticated;
drop policy if exists "admin billing" on public.project_billing;
create policy "admin billing" on public.project_billing for all to authenticated
using (public.is_admin() and public.can_access_project(project_id))
with check (public.is_admin() and public.can_access_project(project_id));
drop policy if exists "admin invoice register" on public.project_invoices;
create policy "admin invoice register" on public.project_invoices for all to authenticated
using (public.is_admin() and public.can_access_project(project_id))
with check (public.is_admin() and public.can_access_project(project_id));
-- Serialize reservations per project so simultaneous saves cannot skip the repeat warning.
create or replace function public.reserve_project_invoice_guard()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Only admins can create project invoices.' using errcode='42501'; end if;
  perform 1 from public.projects where id=new.project_id for update;
  if not found then raise exception 'Project unavailable'; end if;
  if exists (select 1 from unnest(new.task_ids) task_id where not exists (
    select 1 from public.tasks t where t.id=task_id and t.project_id=new.project_id
  )) then raise exception 'Invoice tasks must belong to this project'; end if;
  if not new.repeat_approved and exists (
    select 1 from public.project_invoices i where i.project_id=new.project_id and i.task_ids && new.task_ids
  ) then raise exception 'Tasks already included in an invoice; review repeat billing'; end if;
  return new;
end;
$$;
revoke all on function public.reserve_project_invoice_guard() from public,anon,authenticated;
drop trigger if exists project_invoice_reservation on public.project_invoices;
create trigger project_invoice_reservation before insert on public.project_invoices
for each row execute function public.reserve_project_invoice_guard();
commit;
