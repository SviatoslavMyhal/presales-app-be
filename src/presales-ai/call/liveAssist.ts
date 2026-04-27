import { chatJson, chatStream } from "../ai/llmClient";
import { LiveAssistChunkSchema } from "../ai/schemas";

export interface LiveAssistInput {
  /** Accumulated notes or transcript snippet */
  transcript: string;
  /** Optional deal context */
  job_post?: string;
}

/**
 * Streaming path: yields raw model tokens (caller wraps in SSE).
 * For non-streaming JSON chunk, use runLiveAssistStructured after transcript stabilizes.
 */
export async function* streamLiveAssist(input: LiveAssistInput): AsyncGenerator<string, void, unknown> {
  const system = `You are a live presales copilot. Given partial transcript/notes, continue briefly:
suggest the next best question, flag risks, offer one short phrase the rep can say.
Write in compact prose; the UI may parse bullets.`;

  const user = `Context job post (optional):
${input.job_post ?? "(none)"}

Live notes / transcript:
${input.transcript}`;

  yield* chatStream({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    maxTokens: 800,
  });
}

/** Batch / refresh endpoint: single structured object (non-streaming). */
export async function runLiveAssistStructured(input: LiveAssistInput) {
  const raw = await chatJson({
    messages: [
      {
        role: "system",
        content: `Return one JSON object with optional keys:
suggested_next_question, risks_detected (array), recommended_phrasing, note.`,
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
    maxTokens: 800,
  });
  return LiveAssistChunkSchema.parse(JSON.parse(raw));
}
