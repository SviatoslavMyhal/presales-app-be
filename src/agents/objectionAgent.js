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
      error: "Objection agent returned empty output",
      code: "OBJECTION_EMPTY",
    };
  }
  if (raw.status === "error") {
    return raw;
  }
  const inner =
    raw.data != null && Array.isArray(raw.data.objections)
      ? raw.data
      : Array.isArray(raw.objections)
        ? raw
        : null;
  if (!inner || !Array.isArray(inner.objections) || inner.objections.length < 3) {
    return {
      status: "error",
      error: "Objection output missing objections array.",
      code: "OBJECTION_SCHEMA",
      agent: "objection",
    };
  }
  return {
    status: "success",
    error: null,
    data: { objections: inner.objections },
  };
}

async function run(context) {
  const raw = await runJsonAgent(unwrapSynthesis(context), {
    ...config.objection,
    buildUserMessage: userMessages.objection,
  });
  return normalize(raw);
}

module.exports = { run };
