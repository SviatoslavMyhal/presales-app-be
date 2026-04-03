# Supabase auth & reports

This API uses [Supabase](https://supabase.com) for **email + password** auth and a **`reports`** table scoped per user (RLS). Anonymous users can still call `POST /api/presales/analyze` without a token.

## Environment

Set in `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project URL (**Settings → API** or **Project Settings**) |
| `SUPABASE_ANON_KEY` | Use the **Publishable** key (same as the legacy **anon** / public key). Safe to use in server code and, if needed, in clients; RLS still applies. Put this value here — **not** the Secret key. |

**Dashboard names (current Supabase UI):** **Publishable key** → maps to `SUPABASE_ANON_KEY`. **Secret key(s)** → same idea as **service role**: full access, bypasses RLS — **do not** put in a frontend bundle or use for this API’s normal user flows.

This backend uses the **Publishable (anon)** key plus the caller’s `Authorization: Bearer <access_token>` so Postgres RLS sees the right `auth.uid()`. We do **not** require the Secret key in `.env` for signup, login, or user-scoped reports.

## Supabase dashboard checklist

1. **Create a project** and copy **Project URL** and the **Publishable** key (use it as `SUPABASE_ANON_KEY`).
2. **Authentication → Providers → Email** — enable email/password. Adjust “Confirm email” for dev vs production.
3. **Authentication → URL configuration** — set **Site URL** and **Redirect URLs** for your frontend (e.g. `http://localhost:3000`).
4. **SQL → New query** — run `supabase/migrations/001_reports.sql`, then `002_reports_job_post.sql` (adds `job_post` column), to create/update `public.reports` and RLS policies.
5. Confirm **Table Editor → reports** exists and RLS is enabled.

## API usage (typical SPA)

1. `POST /api/auth/signup` or `POST /api/auth/login` with `{ "email", "password" }` — response includes `session.access_token` (and refresh token).
2. Store tokens per your security model (memory, secure storage). For subsequent calls:  
   `Authorization: Bearer <access_token>`
3. `GET /api/auth/me` — requires a valid Bearer token.
4. `POST /api/reports` — body `{ "title"?: string, "job_post"?: string, "payload": <json> }` — saves arbitrary JSON (e.g. full presales result). Optional `job_post` is stored on the row and returned on list/get for UI (same as `/api/presales/analyze/save`).
5. `GET /api/reports` — list current user’s reports (query: `limit`, `offset`).
6. `GET /api/reports/:id` — one report if it belongs to the user.
7. `DELETE /api/reports/:id` — delete a report you own (204 on success; 404 if missing or not yours).
8. `GET /api/analytics/summary` — dashboard aggregates derived from your saved `reports.result` rows in Supabase (requires Bearer). **`summary.source_rows`** = rows returned from Postgres for your user (RLS). **`summary.total_reports`** = rows successfully scored for the dashboard. **`meta`** duplicates `{ source_rows, scored_count }` for convenience. If `source_rows` is 0, the token user has no reports or is not the account that created them. If `source_rows` > 0 but `total_reports` / `scored_count` is 0, stored `result` payloads could not be parsed or scored (check server logs).
9. `POST /api/presales/analyze/save` — same body as `/api/presales/analyze` plus optional `title`; runs the pipeline and saves the result in one step, including `job_post` on the saved report (requires auth).

`POST /api/presales/analyze` stays **public** (no auth).

## Security notes

- Do not log `Authorization` headers, access tokens, refresh tokens, or passwords.
- Prefer HTTPS in production; tokens in headers are sensitive.
