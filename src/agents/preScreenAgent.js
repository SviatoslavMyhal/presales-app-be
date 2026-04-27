const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

function normalize(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      status: "error",
      error: "Pre-screen agent returned empty output",
      code: "PRE_SCREEN_EMPTY",
    };
  }
  if (raw.status === "error") {
    return raw;
  }
  const inner =
    raw.data != null && raw.data.risk_level != null
      ? raw.data
      : raw.risk_level != null
        ? raw
        : null;
  if (
    !inner ||
    inner.headline == null ||
    !Array.isArray(inner.signals) ||
    inner.recommendation == null
  ) {
    return {
      status: "error",
      error:
        "Pre-screen output missing required fields: risk_level, headline, signals, recommendation.",
      code: "PRE_SCREEN_SCHEMA",
      agent: "pre_screen",
    };
  }
  return {
    status: "success",
    error: null,
    data: {
      risk_level: inner.risk_level,
      headline: inner.headline,
      signals: inner.signals,
      recommendation: inner.recommendation,
      rationale: inner.rationale ?? "",
      suggested_actions: Array.isArray(inner.suggested_actions)
        ? inner.suggested_actions
        : [],
    },
  };
}

async function run(context) {
  const raw = await runJsonAgent(context, {
    ...config.preScreen,
    buildUserMessage: userMessages.preScreen,
  });
  return normalize(raw);
}

module.exports = { run };
