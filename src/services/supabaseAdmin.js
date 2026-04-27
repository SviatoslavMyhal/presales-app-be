const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = require("../config/env");

/**
 * Service-role client (bypasses RLS). Only use server-side for controlled lookups
 * (e.g. public briefing by slug). Returns null if SUPABASE_SERVICE_ROLE_KEY is unset.
 */
function getServiceRoleClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY || String(SUPABASE_SERVICE_ROLE_KEY).trim() === "") {
    return null;
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

module.exports = {
  getServiceRoleClient,
};
