const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

// context shape: { job_post, client_messages, team_expertise, constraints, analyst?, risk?, strategy? }

/**
 * Agent 3 — Strategy: positioning, approach, and call strategy JSON.
 */
async function run(context) {
  return runJsonAgent(context, {
    ...config.strategy,
    buildUserMessage: userMessages.strategy,
  });
}

module.exports = { run };
