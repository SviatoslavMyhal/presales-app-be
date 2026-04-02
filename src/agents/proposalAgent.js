/**
 * Proposal Agent
 * Generates a personalized proposal draft from synthesis + intelligence.
 *
 * context shape:
 * {
 *   synthesis_report: SynthesisReport,
 *   intelligence: IntelligenceData,
 *   job_post: string,
 *   client_messages?: string,
 *   team_expertise?: string,
 *   constraints?: string,
 *   sender_name?: string,
 *   company_name?: string,
 * }
 */

const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

/**
 * @param {Record<string, unknown>} result
 * @returns {Record<string, unknown>}
 */
function normalizeProposalResult(result) {
  if (!result || typeof result !== "object") {
    return {
      status: "error",
      error: "Proposal agent returned empty output",
      code: "PROPOSAL_EMPTY",
    };
  }
  if (result.status === "error") {
    return result;
  }

  let inner = null;
  if (
    result.data != null &&
    typeof result.data === "object" &&
    result.data.subject != null
  ) {
    inner = result.data;
  } else if (result.subject != null) {
    inner = result;
  }

  if (
    !inner ||
    inner.greeting == null ||
    !Array.isArray(inner.sections) ||
    inner.closing == null ||
    inner.signature == null ||
    inner.meta == null
  ) {
    return {
      status: "error",
      error:
        "Proposal output missing required fields: subject, greeting, sections, closing, signature, meta",
      code: "PROPOSAL_SCHEMA",
      agent: "proposal",
    };
  }

  return {
    status: "success",
    error: null,
    data: {
      subject: inner.subject,
      greeting: inner.greeting,
      sections: inner.sections,
      closing: inner.closing,
      signature: inner.signature,
      meta: inner.meta,
    },
  };
}

async function run(context) {
  const sr =
    context.synthesis_report &&
    typeof context.synthesis_report === "object" &&
    context.synthesis_report.report != null
      ? context.synthesis_report.report
      : context.synthesis_report;

  const raw = await runJsonAgent(
    { ...context, synthesis_report: sr },
    {
      ...config.proposal,
      buildUserMessage: userMessages.proposal,
    }
  );
  return normalizeProposalResult(raw);
}

module.exports = { run };
