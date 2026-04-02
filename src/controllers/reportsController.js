const { createClientWithUserAccessToken } = require("../services/supabaseClient");
const { insertReport } = require("../services/reportStorage");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

async function create(req, res) {
  const { title, payload } = req.body ?? {};
  if (payload === undefined || payload === null) {
    return res.status(400).json({ error: "payload is required" });
  }

  const { data, error } = await insertReport({
    accessToken: req.accessToken,
    userId: req.user.id,
    title,
    result: payload,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json(data);
}

async function list(req, res) {
  let limit = Number(req.query.limit);
  if (!Number.isFinite(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }
  limit = Math.min(Math.floor(limit), MAX_LIMIT);

  let offset = Number(req.query.offset);
  if (!Number.isFinite(offset) || offset < 0) {
    offset = 0;
  }
  offset = Math.floor(offset);

  const supabase = createClientWithUserAccessToken(req.accessToken);
  const { data, error } = await supabase
    .from("reports")
    .select("id, user_id, title, created_at, updated_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ reports: data ?? [], limit, offset });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  const supabase = createClientWithUserAccessToken(req.accessToken);
  const { data, error } = await supabase
    .from("reports")
    .select("id, user_id, title, result, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  if (!data) {
    return res.status(404).json({ error: "Report not found" });
  }

  return res.status(200).json(data);
}

async function removeById(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "id is required" });
  }

  const supabase = createClientWithUserAccessToken(req.accessToken);
  const { data, error } = await supabase
    .from("reports")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Report not found" });
  }

  return res.status(204).send();
}

module.exports = {
  create,
  list,
  getById,
  removeById,
};
