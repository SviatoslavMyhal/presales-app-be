# Supabase auth & reports

This API uses [Supabase](https://supabase.com) for **email + password** auth and a **`reports`** table scoped per user (RLS). Anonymous users can still call `POST /api/presales/analyze` without a token.

## Environment

Set in `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project URL (**Settings → API** or **Project Settings**) |
| `SUPABASE_ANON_KEY` | Use the **Publishable** key (same as the legacy **anon** / public key). Safe to use in server code and, if needed, in clients; RLS still applies. Put this value here — **not** the Secret key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Optional.** Fallback for **`GET /api/public/briefings/:slug`** if you do not run migration `004_get_briefing_by_slug_rpc.sql`. Prefer running **004** so public reads use anon + RPC (no secret key on the server). |

**Dashboard names (current Supabase UI):** **Publishable key** → maps to `SUPABASE_ANON_KEY`. **Secret key(s)** → same idea as **service role**: full access, bypasses RLS — **do not** put in a frontend bundle or use for this API’s normal user flows.

This backend uses the **Publishable (anon)** key plus the caller’s `Authorization: Bearer <access_token>` so Postgres RLS sees the right `auth.uid()`. Public briefing fetch uses **anon + `get_briefing_by_slug` RPC** after migration 004; service role is only an optional fallback. Signup, login, and **reports** do **not** require the service role in `.env`.

## Supabase dashboard checklist

1. **Create a project** and copy **Project URL** and the **Publishable** key (use it as `SUPABASE_ANON_KEY`).
2. **Authentication → Providers → Email** — enable email/password. Adjust “Confirm email” for dev vs production.
3. **Authentication → URL configuration** — set **Site URL** and **Redirect URLs** for your frontend (e.g. `http://localhost:3000`).
4. **SQL → New query** — run migrations in order: `001` … `004` (include **`004_get_briefing_by_slug_rpc.sql`** for public briefing URLs without `SUPABASE_SERVICE_ROLE_KEY`).
5. Confirm **Table Editor → reports** and **client_briefings** exist and RLS is enabled.

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

10. `POST /api/presales/prescreen` — same optional fields as analyze (`job_post` required); fast red-flag triage **before** the full pipeline (no auth).
11. `POST /api/call-script/generate`, `POST /api/objections/generate`, `POST /api/competitors/generate` — body includes `synthesis_report`, `job_post`, optional `intelligence`, `client_messages`, `team_expertise`, `constraints`; call-script / objections may also send `risk` and `strategy` JSON for extra context (no auth).
12. `POST /api/follow-up/generate` — body `{ "discussed_summary", "next_step", "red_flags"?, "client_name"?, "job_post"?, "synthesis_report"? }` (no auth).
13. `POST /api/briefings` — requires Bearer; body like proposal (`synthesis_report`, `job_post`, optional `intelligence`, `client_messages`, …). Creates a row in `client_briefings` and returns `{ share: { slug, path } }` for the public URL.
14. `GET /api/public/briefings/:slug` — no auth; returns `{ slug, payload, created_at }`. After migration **004**, works with **anon key only**. If **004** is not applied, set **`SUPABASE_SERVICE_ROLE_KEY`** as fallback (or you get **503** with a hint to run the migration).

## Security notes

- Do not log `Authorization` headers, access tokens, refresh tokens, or passwords.
- Prefer HTTPS in production; tokens in headers are sensitive.
