const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

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
