const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

// context shape: { job_post, client_messages, team_expertise, constraints, analyst?, risk?, strategy? }

/**
 * Agent 4 — Synthesis: final presales report JSON from all upstream agents.
 */
async function run(context) {
  return runJsonAgent(context, {
    ...config.synthesis,
    buildUserMessage: userMessages.synthesis,
  });
}

module.exports = { run };
