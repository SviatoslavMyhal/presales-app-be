const { chat } = require("../../services/openaiService");
const { parseJsonOrEnvelope } = require("../../utils/parseModelJson");
const { loadSkillMarkdown } = require("./loadSkillMarkdown");

const DEFAULT_REMINDER =
  "\n\nReminder: Your entire reply must be a single JSON object matching the schema. No markdown, no extra prose outside JSON.";

/**
 * @typedef {Object} RunJsonAgentOptions
 * @property {string} skillFileName — file under `src/skills/`
 * @property {string} agentKey — used in parse-error envelopes
 * @property {(ctx: Record<string, unknown>) => string} buildUserMessage
 * @property {string} [reminder] — appended after user message (JSON discipline)
 * @property {Record<string, unknown>} [chatOptions] — merged into `chat()` (e.g. `max_tokens`)
 */

/**
 * Shared OpenAI JSON-mode pipeline: system skill + user body → parsed object or parse-error envelope.
 * @param {Record<string, unknown>} context
 * @param {RunJsonAgentOptions} options
 * @returns {Promise<Record<string, unknown>>}
 */
async function runJsonAgent(context, options) {
  const {
    skillFileName,
    agentKey,
    buildUserMessage,
    reminder = DEFAULT_REMINDER,
    chatOptions = {},
  } = options;

  const systemPrompt = loadSkillMarkdown(skillFileName);
  const userMessage = buildUserMessage(context) + reminder;

  const text = await chat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    {
      response_format: { type: "json_object" },
      ...chatOptions,
    }
  );

  return parseJsonOrEnvelope(agentKey, text);
}

module.exports = {
  runJsonAgent,
  DEFAULT_REMINDER,
};
