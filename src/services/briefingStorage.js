const crypto = require("crypto");
const {
  supabase,
  createClientWithUserAccessToken,
} = require("./supabaseClient");
const { getServiceRoleClient } = require("./supabaseAdmin");

async function insertBriefing({ accessToken, userId, payload }) {
  const slug = crypto.randomBytes(12).toString("hex");
  const supabase = createClientWithUserAccessToken(accessToken);
  return supabase
    .from("client_briefings")
    .insert({
      user_id: userId,
      slug,
      payload,
    })
    .select("id, slug, created_at")
    .single();
}

/**
 * Public fetch by slug (no user JWT).
 * 1) RPC `get_briefing_by_slug` (anon key) — see migration 004.
 * 2) Fallback: service role direct select if SUPABASE_SERVICE_ROLE_KEY is set.
 */
async function getBriefingBySlug(slug) {
  const s = String(slug).trim();
  const { data, error } = await supabase.rpc("get_briefing_by_slug", {
    p_slug: s,
  });

  if (!error && data != null) {
    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.slug) {
      return { data: row, error: null };
    }
  }

  const admin = getServiceRoleClient();
  if (admin) {
    return admin
      .from("client_briefings")
      .select("id, slug, payload, created_at")
      .eq("slug", s)
      .maybeSingle();
  }

  if (error) {
    return { data: null, error };
  }

  return { data: null, error: null };
}

module.exports = {
  insertBriefing,
  getBriefingBySlug,
};
