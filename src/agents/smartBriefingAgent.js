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
      error: "Smart briefing agent returned empty output",
      code: "SMART_BRIEFING_EMPTY",
    };
  }
  if (raw.status === "error") {
    return raw;
  }
  const inner =
    raw.data != null && raw.data.page_title != null
      ? raw.data
      : raw.page_title != null
        ? raw
        : null;
  if (
    !inner ||
    inner.intro == null ||
    !Array.isArray(inner.sections) ||
    inner.closing == null
  ) {
    return {
      status: "error",
      error:
        "Smart briefing output missing page_title, intro, sections, or closing.",
      code: "SMART_BRIEFING_SCHEMA",
      agent: "smart_briefing",
    };
  }
  return {
    status: "success",
    error: null,
    data: {
      page_title: inner.page_title,
      intro: inner.intro,
      sections: inner.sections,
      closing: inner.closing,
      meta: inner.meta ?? {},
    },
  };
}

async function run(context) {
  const raw = await runJsonAgent(unwrapSynthesis(context), {
    ...config.smartBriefing,
    buildUserMessage: userMessages.smartBriefing,
  });
  return normalize(raw);
}

module.exports = { run };
