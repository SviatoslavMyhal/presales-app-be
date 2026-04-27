-- Public read by slug without exposing the whole table to anon SELECT.
-- Node uses anon key + RPC (no service role required for GET /api/public/briefings/:slug).

create or replace function public.get_briefing_by_slug(p_slug text)
returns table (
  id uuid,
  slug text,
  payload jsonb,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select b.id, b.slug, b.payload, b.created_at
  from public.client_briefings b
  where b.slug = p_slug
  limit 1;
$$;

grant execute on function public.get_briefing_by_slug(text) to anon;
grant execute on function public.get_briefing_by_slug(text) to authenticated;
