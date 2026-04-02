/**
 * Scoring Service
 * Normalizes and scores a completed presales report.
 * Input: the full response object from agentOrchestrator.run()
 * Output: a flat scored record ready for storage and aggregation
 */

/**
 * Derives opportunity tier from confidence score + risk profile
 * high:   confidence >= 7.0 AND no high-severity risks
 * medium: confidence >= 5.0 OR only 1 high-severity risk
 * low:    confidence < 5.0 OR 2+ high-severity risks
 */
function deriveOpportunityTier(confidenceScore, risks) {
  const highRisks = risks.filter((r) => r.severity === "high").length;
  if (confidenceScore >= 7.0 && highRisks === 0) return "high";
  if (confidenceScore >= 5.0 && highRisks <= 1) return "medium";
  return "low";
}

/**
 * Derives conversion signal from opportunity tier + client type
 * ready_to_start:  high opportunity + client is not Chaotic
 * needs_discovery: medium opportunity OR missing key data
 * high_risk:       low opportunity OR Chaotic client
 */
function deriveConversionSignal(opportunityTier, clientType) {
  if (opportunityTier === "low" || clientType === "Chaotic / unclear") {
    return "high_risk";
  }
  if (opportunityTier === "high" && clientType !== "Chaotic / unclear") {
    return "ready_to_start";
  }
  return "needs_discovery";
}

/**
 * Maps intelligence client_type to canonical analytics keys (see intelligenceAgent.md).
 * Possible raw types: "Technical Founder", "Non-technical Founder", "Enterprise",
 * "Agency", "Chaotic / unclear". Unknown strings → "other".
 */
function normalizeClientType(type) {
  if (type == null || String(type).trim() === "") return "other";
  const t = String(type).trim().toLowerCase();

  if (t === "chaotic / unclear" || (t.includes("chaotic") && t.includes("unclear"))) {
    return "chaotic_unclear";
  }
  if (t.includes("non-technical") || t.includes("non technical")) {
    return "non_technical_founder";
  }
  if (t.includes("technical founder") || t === "technical founder") {
    return "technical_founder";
  }
  if (t.includes("enterprise")) return "enterprise";
  if (t.includes("agency")) return "agency";

  return "other";
}

/**
 * Extracts and normalizes all risk types from risks array
 * Maps raw type strings to canonical keys
 */
function normalizeRiskTypes(risks) {
  const typeMap = {
    scope_creep: "scope_creep",
    unrealistic_expectations: "unrealistic_expectations",
    unclear_ownership: "unclear_ownership",
    budget_mismatch: "budget_mismatch",
    technical_debt: "technical_debt",
    communication: "communication",
    timeline: "timeline",
    missing_info: "missing_info",
  };
  return risks.map((r) => typeMap[r.type] || "missing_info");
}

/**
 * Main scoring function
 * @param {object} reportResponse — full response from agentOrchestrator.run()
 * @returns {object} scored record
 */
function scoreReport(reportResponse) {
  const synthesis = reportResponse?.synthesis?.report || {};
  const intelligence = reportResponse?.intelligence?.data || {};
  const riskData = reportResponse?.risk?.data || {};

  const confidenceScore = intelligence?.confidence?.score ?? 0;
  const clientTypeRaw = intelligence?.client_type?.type ?? "";
  const rawRisks = synthesis?.risks ?? riskData?.risks ?? [];
  const risks = Array.isArray(rawRisks) ? rawRisks : [];
  const highRisks = risks.filter((r) => r.severity === "high");

  const clientTypeNorm = normalizeClientType(clientTypeRaw);
  const opportunityTier = deriveOpportunityTier(confidenceScore, risks);
  const conversionSignal = deriveConversionSignal(opportunityTier, clientTypeRaw);
  const riskTypes = normalizeRiskTypes(risks);

  // Opportunity score: weighted blend of confidence + tier
  const tierScoreMap = { high: 9, medium: 6, low: 3 };
  const opportunityScore = parseFloat(
    (confidenceScore * 0.7 + tierScoreMap[opportunityTier] * 0.3).toFixed(2)
  );

  return {
    id: `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    date: new Date().toISOString().split("T")[0],
    confidence_score: confidenceScore,
    opportunity_score: opportunityScore,
    opportunity_tier: opportunityTier,
    client_type: clientTypeNorm,
    client_type_raw: clientTypeRaw,
    conversion_signal: conversionSignal,
    risk_types: riskTypes,
    high_risk_count: highRisks.length,
    total_risk_count: risks.length,
  };
}

module.exports = {
  scoreReport,
  deriveOpportunityTier,
  deriveConversionSignal,
  normalizeClientType,
};
