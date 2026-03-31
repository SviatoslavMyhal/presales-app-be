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
  synthesis,
};
