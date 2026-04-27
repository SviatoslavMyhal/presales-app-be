import path from "path";
import { randomUUID } from "crypto";
import type { Deal, DealInput } from "../shared/types";
import { PipelineError } from "../shared/errors";
import { saveDeal, getDeal, appendInsights, listInsights } from "./insightStore";
import { mapPipelineToInsights, computeScoresFromPipeline } from "./pipelineMapper";
import { knowledgeMemory } from "../knowledge/knowledgeMemory";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const orchestrator = require(path.join(
  __dirname,
  "../../../src/services/agentOrchestrator.js"
)) as { run: (input: DealInput) => Promise<Record<string, unknown>> };

export async function analyzeDeal(input: DealInput): Promise<{
  deal: Deal;
  pipeline: Record<string, unknown>;
  insights: ReturnType<typeof appendInsights>;
}> {
  const pipeline = await orchestrator.run(input).catch((e: unknown) => {
    throw new PipelineError("Orchestrator failed", e);
  });

  const id = randomUUID();
  const now = new Date().toISOString();
  const scores = computeScoresFromPipeline(pipeline);

  const deal: Deal = {
    id,
    input,
    createdAt: now,
    updatedAt: now,
    pipeline,
    scores,
  };

  saveDeal(deal);
  const insightPayloads = mapPipelineToInsights(id, pipeline);
  insightPayloads.push({
    type: "score",
    title: "Deal scores",
    body: scores,
    meta: { engine: "presales-ai" },
  });
  const insights = appendInsights(id, insightPayloads);

  knowledgeMemory.recordDeal({
    id,
    jobPost: input.job_post,
    scores,
    createdAt: now,
  });

  return { deal, pipeline, insights };
}

export function insightsForDeal(dealId: string) {
  return {
    deal: getDeal(dealId),
    insights: listInsights(dealId),
  };
}
