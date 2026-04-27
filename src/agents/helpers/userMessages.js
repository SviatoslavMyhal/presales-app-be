const { formatOptional } = require("./formatOptional");

/**
 * Shared tail: client messages, team expertise, constraints.
 * @param {Record<string, unknown>} context
 * @param {string} teamLabel
 */
function tailContext(context, teamLabel) {
  return `Client messages (optional):
${formatOptional(context.client_messages)}

${teamLabel}:
${formatOptional(context.team_expertise)}

Constraints (optional):
${formatOptional(context.constraints)}`;
}

/** @param {Record<string, unknown>} context */
function analyst(context) {
  const jobPost = context.job_post ?? "";
  return `Job post / project description:
${jobPost}

${tailContext(context, "Team expertise / tech stack (optional)")}`;
}

/** @param {Record<string, unknown>} context */
function risk(context) {
  const agent1 = context.analyst ?? context.agent1_output;
  const jobPost = context.job_post ?? "";
  return `Agent 1 output:
${formatOptional(agent1)}

Original job post:
${jobPost}

${tailContext(context, "Team expertise (optional)")}`;
}

/** @param {Record<string, unknown>} context */
function strategy(context) {
  const agent1 = context.analyst ?? context.agent1_output;
  const agent2 = context.risk ?? context.agent2_output;
  const jobPost = context.job_post ?? "";
  return `Agent 1 output:
${formatOptional(agent1)}

Agent 2 output:
${formatOptional(agent2)}

Original job post:
${jobPost}

${tailContext(context, "Team expertise (optional)")}`;
}

/** @param {Record<string, unknown>} context */
function intelligence(context) {
  const agent1 = context.agent1 ?? context.analyst ?? context.agent1_output;
  const jobPost = context.job_post ?? "";
  return `Job post / project description:
${jobPost}

Agent 1 (Analyst) output:
${formatOptional(agent1)}

${tailContext(context, "Team expertise / tech stack (optional)")}`;
}

/** @param {Record<string, unknown>} context */
function proposal(context) {
  const synthesisReport = context.synthesis_report ?? context.synthesis;
  const intelligence = context.intelligence;
  const jobPost = context.job_post ?? "";
  const senderName = context.sender_name ?? "";
  const companyName = context.company_name ?? "";

  return `Synthesis report (full JSON):
${formatOptional(synthesisReport)}

Intelligence output:
${formatOptional(intelligence)}

Original job post:
${jobPost}

Sender name (optional):
${formatOptional(senderName)}

Company / agency name (optional):
${formatOptional(companyName)}

${tailContext(context, "Team expertise (optional)")}`;
}

function synthesisIntelligenceBase(context) {
  const synthesisReport = context.synthesis_report ?? context.synthesis;
  const intelligence = context.intelligence;
  const jobPost = context.job_post ?? "";
  return `Synthesis report (full JSON):
${formatOptional(synthesisReport)}

Intelligence output:
${formatOptional(intelligence)}

Original job post:
${jobPost}

${tailContext(context, "Team expertise (optional)")}`;
}

/** @param {Record<string, unknown>} context */
function callScript(context) {
  return synthesisIntelligenceBase(context);
}

/** @param {Record<string, unknown>} context */
function objection(context) {
  return `${synthesisIntelligenceBase(context)}

Risk agent output (optional, if provided separately):
${formatOptional(context.risk)}

Strategy agent output (optional, if provided separately):
${formatOptional(context.strategy)}`;
}

/** @param {Record<string, unknown>} context */
function preScreen(context) {
  const jobPost = context.job_post ?? "";
  return `Job post / project description:
${jobPost}

${tailContext(context, "Team expertise / tech stack (optional)")}`;
}

/** @param {Record<string, unknown>} context */
function competitor(context) {
  return synthesisIntelligenceBase(context);
}

/** @param {Record<string, unknown>} context */
function followUp(context) {
  return `What we discussed (your notes):
${formatOptional(context.discussed_summary)}

Agreed next step:
${formatOptional(context.next_step)}

Red flags or concerns (optional):
${formatOptional(context.red_flags)}

Client name (optional, for greeting):
${formatOptional(context.client_name)}

Original job post (optional):
${formatOptional(context.job_post)}

Synthesis or report JSON (optional, for tone and context):
${formatOptional(context.synthesis_report ?? context.synthesis)}`;
}

/** @param {Record<string, unknown>} context */
function smartBriefing(context) {
  return synthesisIntelligenceBase(context);
}

/** @param {Record<string, unknown>} context */
function synthesis(context) {
  const agent1 = context.analyst ?? context.agent1_output;
  const agent2 = context.risk ?? context.agent2_output;
  const agent3 = context.strategy ?? context.agent3_output;
  const jobPost = context.job_post ?? "";
  return `Agent 1 output:
${formatOptional(agent1)}

Agent 2 output:
${formatOptional(agent2)}

Agent 3 output:
${formatOptional(agent3)}

Original job post:
${jobPost}

${tailContext(context, "Team expertise (optional)")}`;
}

module.exports = {
  analyst,
  risk,
  strategy,
  intelligence,
  proposal,
  callScript,
  objection,
  preScreen,
  competitor,
  followUp,
  smartBriefing,
  synthesis,
};