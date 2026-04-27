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
      error: "Call script agent returned empty output",
      code: "CALL_SCRIPT_EMPTY",
    };
  }
  if (raw.status === "error") {
    return raw;
  }
  const inner =
    raw.data != null && Array.isArray(raw.data.phases)
      ? raw.data
      : Array.isArray(raw.phases)
        ? raw
        : null;
  if (
    !inner ||
    !Array.isArray(inner.phases) ||
    inner.phases.length < 4
  ) {
    return {
      status: "error",
      error: "Call script output missing phases array (expected 5 timed blocks).",
      code: "CALL_SCRIPT_SCHEMA",
      agent: "call_script",
    };
  }
  return {
    status: "success",
    error: null,
    data: {
      phases: inner.phases,
      meta: inner.meta ?? {},
    },
  };
}

async function run(context) {
  const raw = await runJsonAgent(unwrapSynthesis(context), {
    ...config.callScript,
    buildUserMessage: userMessages.callScript,
  });
  return normalize(raw);
}

module.exports = { run };
