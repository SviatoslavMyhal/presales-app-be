import type { DealScores, Insight } from "../shared/types";

/**
 * Maps existing orchestrator pipeline JSON into typed insights + scores.
 * Keeps a traceable artifact layer for SaaS / monetization.
 */
export function mapPipelineToInsights(
  dealId: string,
  pipeline: Record<string, unknown>
): Omit<Insight, "id" | "dealId" | "createdAt">[] {
  const out: Omit<Insight, "id" | "dealId" | "createdAt">[] = [];

  const analyst = pipeline.analyst as Record<string, unknown> | undefined;
  if (analyst?.status === "success" && analyst.data) {
    const data = analyst.data as Record<string, unknown>;
    out.push({
      type: "summary",
      title: "Opportunity summary",
      body: data,
      meta: { source: "analyst" },
    });
  }

  const risk = pipeline.risk as Record<string, unknown> | undefined;
  if (risk?.status === "success" && risk.data) {
    out.push({
      type: "risk",
      title: "Discovery & risks",
      body: risk.data,
      meta: { source: "risk" },
    });
  }

  const strategy = pipeline.strategy as Record<string, unknown> | undefined;
  if (strategy?.status === "success" && strategy.data) {
    out.push({
      type: "solution_variant",
      title: "Strategy & positioning",
      body: strategy.data,
      meta: { source: "strategy" },
    });
  }

  const intelligence = pipeline.intelligence as Record<string, unknown> | undefined;
  if (intelligence?.status === "success" && intelligence.data) {
    out.push({
      type: "psychology",
      title: "Client intelligence",
      body: intelligence.data,
      meta: { source: "intelligence" },
    });
  }

  const synthesis = pipeline.synthesis as Record<string, unknown> | undefined;
  if (synthesis?.status === "success" && synthesis.data) {
    out.push({
      type: "summary",
      title: "Synthesis report",
      body: synthesis.data,
      meta: { source: "synthesis" },
    });
  }

  return out;
}

export function computeScoresFromPipeline(pipeline: Record<string, unknown>): DealScores {
  const intel = pipeline.intelligence as { data?: { confidence?: { score?: number } } } | undefined;
  const risk = pipeline.risk as { data?: { risks?: unknown[] } } | undefined;
  const conf = intel?.data?.confidence?.score ?? 5;
  const riskList = risk?.data?.risks;
  const riskCount = Array.isArray(riskList) ? riskList.length : 0;
  const riskScore = Math.min(10, 3 + riskCount * 0.6);

  return {
    deal_quality: Math.round(Number(conf) * 10) / 10,
    risk_score: Math.round(riskScore * 10) / 10,
    confidence: conf,
    labels: {
      deal_quality: conf >= 7 ? "strong" : conf >= 4 ? "mixed" : "weak",
      risk: riskScore >= 7 ? "elevated" : "moderate",
    },
  };
}
