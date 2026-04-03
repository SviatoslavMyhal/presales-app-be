const { createClientWithUserAccessToken } = require("./supabaseClient");

function normalizeJobPost(value) {
  if (value == null || value === "") {
    return null;
  }
  const s = String(value).trim();
  return s === "" ? null : s;
}

async function insertReport({ accessToken, userId, title, result, job_post }) {
  const supabase = createClientWithUserAccessToken(accessToken);
  return supabase
    .from("reports")
    .insert({
      user_id: userId,
      title: title != null && String(title).trim() !== "" ? String(title).trim() : null,
      job_post: normalizeJobPost(job_post),
      result,
    })
    .select("id, user_id, title, job_post, result, created_at, updated_at")
    .single();
}

module.exports = {
  insertReport,
};
