import OpenAI from "openai";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key || !String(key).trim()) {
      throw new Error("OPENAI_API_KEY is required for PreSalesAI modules");
    }
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatJson(options: {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const c = getClient();
  const res = await c.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: options.messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 2048,
    response_format: { type: "json_object" },
  });
  return res.choices[0]?.message?.content ?? "";
}

/**
 * Streaming-ready: yields text deltas for live call assist (SSE / NDJSON upstream).
 */
export async function* chatStream(options: {
  messages: ChatMessage[];
  maxTokens?: number;
}): AsyncGenerator<string, void, unknown> {
  const c = getClient();
  const stream = await c.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: options.messages,
    max_tokens: options.maxTokens ?? 1024,
    temperature: 0.3,
    stream: true,
  });

  for await (const chunk of stream) {
    const t = chunk.choices[0]?.delta?.content;
    if (t) yield t;
  }
}
