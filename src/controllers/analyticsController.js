const analyticsService = require("../services/analyticsService");

async function getSummary(req, res) {
  try {
    const analytics = await analyticsService.getAggregatedAnalytics(req.accessToken);
    const sourceRows = analytics.summary?.source_rows ?? 0;
    const scored = analytics.summary?.total_reports ?? 0;
    const payload = {
      ...analytics,
      meta: analytics.meta ?? {
        source_rows: sourceRows,
        scored_count: scored,
      },
    };
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to load analytics" });
  }
}

module.exports = { getSummary };
