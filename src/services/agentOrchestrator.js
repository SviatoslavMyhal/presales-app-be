const analystAgent = require("../agents/analystAgent");
const riskAgent = require("../agents/riskAgent");
const strategyAgent = require("../agents/strategyAgent");
const synthesisAgent = require("../agents/synthesisAgent");

/**
 * Runs the four presales agents in sequence, passing accumulated context forward.
 */
async function run(input) {
  // TODO: replace with real Anthropic API call
  const analystResult = await analystAgent.run(input);
  // TODO: replace with real Anthropic API call
  const riskResult = await riskAgent.run({
    ...input,
    analyst: analystResult,
  });
  const strategyResult = await strategyAgent.run({
    ...input,
    analyst: analystResult,
    risk: riskResult,
  });
  const synthesisResult = await synthesisAgent.run({
    ...input,
    analyst: analystResult,
    risk: riskResult,
    strategy: strategyResult,
  });

  return {
    analyst: analystResult,
    risk: riskResult,
    strategy: strategyResult,
    synthesis: synthesisResult,
  };
}

module.exports = {
  run,
};
