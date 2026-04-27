import { chatJson } from "../ai/llmClient";
import { CategorizedQuestionsSchema, parseJson } from "../ai/schemas";
import type { DealInput } from "../shared/types";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const orchestrator = require(path.join(
  __dirname,
  "../../../src/services/agentOrchestrator.js"
)) as { run: (input: DealInput) => Promise<Record<string, unknown>> };

const SYSTEM = `You are a senior presales consultant. Generate 8–12 discovery questions total, grouped into four categories:
business, technical, risks, scope. Questions must be specific to the project described — never generic filler.
Output exactly one JSON object with keys: business, technical, risks, scope — each an array of strings.`;

/**
 * Option A: run full pipeline and extract from risk output (structured).
 * Option B (implemented for speed): dedicated JSON generation for categorized questions only.
 */
export async function generateQuestions(input: DealInput): Promise<ReturnType<typeof CategorizedQuestionsSchema.parse>> {
  const user = `Job post:
${input.job_post}

Client messages:
${input.client_messages ?? "(none)"}

Constraints:
${input.constraints ?? "(none)"}

Team expertise:
${input.team_expertise ?? "(none)"}`;

  const raw = await chatJson({
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: user },
    ],
    maxTokens: 1200,
  });
  return parseJson(CategorizedQuestionsSchema, raw);
}

/** Reuse orchestrator risk agent output when you need consistency with main pipeline. */
export async function generateQuestionsFromPipeline(input: DealInput): Promise<Record<string, unknown>> {
  const pipeline = await orchestrator.run(input);
  return pipeline as Record<string, unknown>;
}
