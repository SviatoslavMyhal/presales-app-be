const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

// context shape: { job_post, client_messages, team_expertise, constraints, analyst?, risk?, strategy? }

/**
 * Agent 2 — Risk & Discovery: discovery questions + risks JSON from Agent 1 context.
 */
async function run(context) {
  return runJsonAgent(context, {
    ...config.risk,
    buildUserMessage: userMessages.risk,
  });
}

module.exports = { run };
