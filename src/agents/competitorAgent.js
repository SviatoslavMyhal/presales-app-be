const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

function unwrapSynthesis(context) {
  const sr =
    context.synthesis_report &&
    typeof context.synthesis_report === "object" &&
    context.synthesis_report.report != null
      ? context.synthesis_report.report
      : context.synthesis_report;
  return { ...context, synthesis_report: sr };
}

function normalize(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      status: "error",
      error: "Competitor agent returned empty output",
      code: "COMPETITOR_EMPTY",
    };
  }
  if (raw.status === "error") {
    return raw;
  }
  const inner =
    raw.data != null && Array.isArray(raw.data.scenarios)
      ? raw.data
      : Array.isArray(raw.scenarios)
        ? raw
        : null;
  if (!inner || !Array.isArray(inner.scenarios) || inner.scenarios.length < 2) {
    return {
      status: "error",
      error: "Competitor output missing scenarios array.",
      code: "COMPETITOR_SCHEMA",
      agent: "competitor",
    };
  }
  return {
    status: "success",
    error: null,
    data: {
      scenarios: inner.scenarios,
      meta: inner.meta ?? {},
    },
  };
}

async function run(context) {
  const raw = await runJsonAgent(unwrapSynthesis(context), {
    ...config.competitor,
    buildUserMessage: userMessages.competitor,
  });
  return normalize(raw);
}

module.exports = { run };
