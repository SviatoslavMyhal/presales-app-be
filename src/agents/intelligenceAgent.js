/**
 * Intelligence Agent
 * Produces confidence score, client type detection, and suggested pitch.
 * Runs after Agent 1. Does not depend on Agents 2, 3, or 4.
 *
 * context shape:
 * {
 *   job_post, client_messages, team_expertise, constraints,
 *   agent1: Agent 1 full JSON (or analyst / agent1_output)
 * }
 */

const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

/**
 * @param {Record<string, unknown>} result
 * @returns {Record<string, unknown>}
 */
function normalizeIntelligenceResult(result) {
  if (!result || typeof result !== "object") {
    return {
      status: "error",
      error: "Intelligence agent returned empty output",
      code: "INTELLIGENCE_EMPTY",
    };
  }
  if (result.status === "error") {
    return result;
  }

  let inner = null;
  if (
    result.data != null &&
    typeof result.data === "object" &&
    result.data.confidence != null
  ) {
    inner = result.data;
  } else if (result.confidence != null) {
    inner = result;
  }

  if (
    !inner ||
    inner.client_type == null ||
    inner.suggested_pitch == null
  ) {
    return {
      status: "error",
      error:
        'Intelligence output missing required fields: confidence, client_type, suggested_pitch',
      code: "INTELLIGENCE_SCHEMA",
      agent: "intelligence",
    };
  }

  return {
    status: "success",
    error: null,
    data: {
      confidence: inner.confidence,
      client_type: inner.client_type,
      suggested_pitch: inner.suggested_pitch,
    },
  };
}

async function run(context) {
  const raw = await runJsonAgent(context, {
    ...config.intelligence,
    buildUserMessage: userMessages.intelligence,
  });
  return normalizeIntelligenceResult(raw);
}

module.exports = { run };
