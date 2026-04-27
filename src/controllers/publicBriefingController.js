const { getBriefingBySlug } = require("../services/briefingStorage");

async function getBySlug(req, res) {
  const { slug } = req.params;
  if (!slug || !String(slug).trim()) {
    return res.status(400).json({ error: "slug is required" });
  }

  const { data, error } = await getBriefingBySlug(slug);

  if (error) {
    const msg = String(error.message ?? error);
    if (
      /function .* does not exist|Could not find the function/i.test(msg) ||
      /schema cache/i.test(msg)
    ) {
      return res.status(503).json({
        error:
          "Run Supabase migration 004_get_briefing_by_slug_rpc.sql (or set SUPABASE_SERVICE_ROLE_KEY as fallback). See AUTH.md.",
      });
    }
    return res.status(400).json({ error: msg });
  }

  if (!data) {
    return res.status(404).json({ error: "Briefing not found" });
  }

  return res.status(200).json({
    slug: data.slug,
    payload: data.payload,
    created_at: data.created_at,
  });
}

module.exports = { getBySlug };
