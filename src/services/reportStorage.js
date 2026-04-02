const { createClientWithUserAccessToken } = require("./supabaseClient");

async function insertReport({ accessToken, userId, title, result }) {
  const supabase = createClientWithUserAccessToken(accessToken);
  return supabase
    .from("reports")
    .insert({
      user_id: userId,
      title: title != null && String(title).trim() !== "" ? String(title).trim() : null,
      result,
    })
    .select("id, user_id, title, result, created_at, updated_at")
    .single();
}

module.exports = {
  insertReport,
};
