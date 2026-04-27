import { chatJson } from "../ai/llmClient";
import { PsychologyRiskSchema, parseJson } from "../ai/schemas";
import type { DealInput } from "../shared/types";

const SYSTEM = `You are a presales psychologist and risk analyst. Detect:
- vague_requirements
- red_flags
- unrealistic_expectations
- budget_signals (from text or absence)

Then provide response_strategy: how the seller should position on a call (2-4 sentences).
Output one JSON object only.`;

export async function analyzePsychology(input: DealInput): Promise<ReturnType<typeof PsychologyRiskSchema.parse>> {
  const user = `Input:
${input.job_post}

Client messages:
${input.client_messages ?? "(none)"}

Constraints:
${input.constraints ?? "(none)"}`;

  const raw = await chatJson({
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: user },
    ],
    maxTokens: 1500,
  });
  return parseJson(PsychologyRiskSchema, raw);
}
