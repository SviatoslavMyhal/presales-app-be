-- Run in Supabase SQL Editor (or via CLI) after creating the project.
-- Enables user-scoped presales reports with RLS.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_user_id_created_at_idx
  on public.reports (user_id, created_at desc);

alter table public.reports enable row level security;

-- Idempotent: safe to re-run if policies already exist
drop policy if exists "reports_select_own" on public.reports;
drop policy if exists "reports_insert_own" on public.reports;
drop policy if exists "reports_update_own" on public.reports;
drop policy if exists "reports_delete_own" on public.reports;

create policy "reports_select_own"
  on public.reports
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "reports_insert_own"
  on public.reports
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "reports_update_own"
  on public.reports
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reports_delete_own"
  on public.reports
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.reports_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
  before update on public.reports
  for each row
  execute function public.reports_set_updated_at();
