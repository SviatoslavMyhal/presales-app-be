const OpenAI = require("openai");
const { OPENAI_API_KEY, OPENAI_MODEL } = require("../config/env");

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

async function chat(messages, options = {}) {
  const model = options.model ?? OPENAI_MODEL;
  const temperature = options.temperature ?? 0;
  const max_tokens = options.max_tokens ?? 2000;
  const response_format = options.response_format;

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      ...(response_format ? { response_format } : {}),
    });
    const content = response.choices[0]?.message?.content;
    return content ?? "";
  } catch (err) {
    throw new Error(`OpenAI API error: ${err.message}`);
  }
}

module.exports = {
  chat,
};
