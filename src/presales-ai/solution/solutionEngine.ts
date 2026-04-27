import { chatJson } from "../ai/llmClient";
import { SolutionVariantsSchema, parseJson } from "../ai/schemas";
import type { DealInput } from "../shared/types";

const SYSTEM = `You are a solution architect. Given a presales brief, propose TWO variants:
1) fast — MVP / 80-20, time-to-value
2) scalable — longer horizon, maintainability

Each variant: summary (2-3 sentences) and tradeoffs (bullet strings).
Also add architecture_notes: concrete technical decisions to validate on a discovery call.
Output one JSON object matching the schema you were given in the user message structure.`;

export async function generateSolution(input: DealInput): Promise<ReturnType<typeof SolutionVariantsSchema.parse>> {
  const user = `Project:
${input.job_post}

Messages:
${input.client_messages ?? "(none)"}

Constraints:
${input.constraints ?? "(none)"}

Expertise:
${input.team_expertise ?? "(none)"}

Return JSON with keys: fast { summary, tradeoffs[] }, scalable { summary, tradeoffs[] }, architecture_notes[]`;

  const raw = await chatJson({
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: user },
    ],
    maxTokens: 2000,
  });
  return parseJson(SolutionVariantsSchema, raw);
}
