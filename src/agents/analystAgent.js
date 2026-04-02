const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

// context shape: { job_post, client_messages, team_expertise, constraints, analyst?, risk?, strategy? }

/**
 * Agent 1 — Analyst: validates input and produces opportunity analysis JSON.
 */
async function run(context) {
  return runJsonAgent(context, {
    ...config.analyst,
    buildUserMessage: userMessages.analyst,
  });
}

module.exports = { run };
