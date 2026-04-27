-- Public shareable pre-call briefings (read by slug via API using service role).

create table if not exists public.client_briefings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists client_briefings_user_id_created_at_idx
  on public.client_briefings (user_id, created_at desc);

alter table public.client_briefings enable row level security;

drop policy if exists "client_briefings_insert_own" on public.client_briefings;
drop policy if exists "client_briefings_select_own" on public.client_briefings;
drop policy if exists "client_briefings_delete_own" on public.client_briefings;

create policy "client_briefings_insert_own"
  on public.client_briefings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "client_briefings_select_own"
  on public.client_briefings
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "client_briefings_delete_own"
  on public.client_briefings
  for delete
  to authenticated
  using (auth.uid() = user_id);
