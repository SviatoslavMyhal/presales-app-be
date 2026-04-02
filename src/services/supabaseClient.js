const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require("../config/env");

/** Server-side client for Auth (signup/login) — no user JWT. */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Client scoped to the caller's access token so Postgres RLS sees auth.uid().
 * Never log or persist the token.
 */
function createClientWithUserAccessToken(accessToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}

module.exports = {
  supabase,
  createClientWithUserAccessToken,
};
