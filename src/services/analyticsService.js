const { createClientWithUserAccessToken } = require("./supabaseClient");
const scoringService = require("./scoringService");

/**
 * Supabase JSONB is usually a parsed object; some clients/serializers return a JSON string.
 * @param {unknown} raw
 * @returns {object | null}
 */
function parseReportPayload(raw) {
  if (raw == null) {
    return null;
  }
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value;
}

/**
 * Loads all reports for the authenticated user (RLS), scores each stored `result`,
 * and returns the same dashboard shape as before.
 * @param {string} accessToken — user JWT (RLS)
 * @returns {Promise<object>}
 */
async function getAggregatedAnalytics(accessToken) {
  const supabase = createClientWithUserAccessToken(accessToken);
  const { data: rows, error } = await supabase
    .from("reports")
    .select("id, result, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    const err = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  const list = rows || [];
  const reports = [];
  for (const row of list) {
    const payload = parseReportPayload(row.result);
    if (!payload) {
      console.warn("[Analytics] Skip report (unusable result payload)", row.id);
      continue;
    }
    try {
      const scored = scoringService.scoreReport(payload);
      const dateStr = row.created_at ? String(row.created_at).split("T")[0] : scored.date;
      scored.date = dateStr;
      scored.created_at = row.created_at || scored.created_at;
      reports.push(scored);
    } catch (err) {
      console.error("[Analytics] Skip report", row.id, err.message);
    }
  }

  const meta = {
    source_rows: list.length,
    scored_count: reports.length,
  };

  if (reports.length === 0) {
    return {
      ...buildEmptyAnalytics(list.length),
      meta,
    };
  }

  return {
    ...aggregateFromScoredReports(reports, list.length),
    meta,
  };
}

function aggregateFromScoredReports(reports, sourceRowCount) {
  const avgOpportunityScore = average(reports.map((r) => r.opportunity_score));
  const avgConfidence = average(reports.map((r) => r.confidence_score));

  const opportunities = countByField(reports, "opportunity_tier");

  const allRiskTypes = reports.flatMap((r) => r.risk_types || []);
  const riskDist = countOccurrences(allRiskTypes);
  const mostCommonRisk =
    Object.entries(riskDist).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const totalHighRisks = reports.reduce((sum, r) => sum + (r.high_risk_count || 0), 0);

  const clientCounts = countByField(reports, "client_type");

  const conversionCounts = countByField(reports, "conversion_signal");

  const byDate = {};
  reports.forEach((r) => {
    const d = r.date || (r.created_at && String(r.created_at).split("T")[0]);
    if (!d) return;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(r.opportunity_score);
  });
  const timeline = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, scores]) => ({
      date,
      reports: scores.length,
      avg_score: parseFloat(average(scores).toFixed(2)),
    }));

  const srcRows =
    typeof sourceRowCount === "number" ? sourceRowCount : reports.length;

  return {
    summary: {
      total_reports: reports.length,
      /** Rows returned from Supabase for this user (before scoring skips). */
      source_rows: srcRows,
      avg_opportunity_score: parseFloat(avgOpportunityScore.toFixed(2)),
      avg_confidence: parseFloat(avgConfidence.toFixed(2)),
    },
    opportunities: {
      high: opportunities.high || 0,
      medium: opportunities.medium || 0,
      low: opportunities.low || 0,
    },
    risks: {
      total_high: totalHighRisks,
      most_common: mostCommonRisk,
      distribution: riskDist,
    },
    clients: {
      technical_founder: clientCounts.technical_founder || 0,
      non_technical_founder: clientCounts.non_technical_founder || 0,
      enterprise: clientCounts.enterprise || 0,
      agency: clientCounts.agency || 0,
      chaotic_unclear: clientCounts.chaotic_unclear || 0,
      other: clientCounts.other || 0,
    },
    conversion_signals: {
      ready_to_start: conversionCounts.ready_to_start || 0,
      needs_discovery: conversionCounts.needs_discovery || 0,
      high_risk: conversionCounts.high_risk || 0,
    },
    timeline,
  };
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function countByField(arr, field) {
  return arr.reduce((acc, item) => {
    const key = item[field];
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function countOccurrences(arr) {
  return arr.reduce((acc, val) => {
    if (val) acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

function buildEmptyAnalytics(sourceRows = 0) {
  return {
    summary: {
      total_reports: 0,
      source_rows: sourceRows,
      avg_opportunity_score: 0,
      avg_confidence: 0,
    },
    opportunities: { high: 0, medium: 0, low: 0 },
    risks: { total_high: 0, most_common: null, distribution: {} },
    clients: {
      technical_founder: 0,
      non_technical_founder: 0,
      enterprise: 0,
      agency: 0,
      chaotic_unclear: 0,
      other: 0,
    },
    conversion_signals: { ready_to_start: 0, needs_discovery: 0, high_risk: 0 },
    timeline: [],
  };
}

module.exports = { getAggregatedAnalytics };
