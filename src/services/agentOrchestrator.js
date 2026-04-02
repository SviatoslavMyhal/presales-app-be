const analystAgent = require("../agents/analystAgent");
const intelligenceAgent = require("../agents/intelligenceAgent");
const riskAgent = require("../agents/riskAgent");
const strategyAgent = require("../agents/strategyAgent");
const synthesisAgent = require("../agents/synthesisAgent");

/**
 * Runs Agent 1, then intelligence + risk in parallel, then strategy and synthesis.
 * Intelligence does not block the 4-agent pipeline; its output is added as `intelligence`.
 */
async function run(input) {
  const agent1Result = await analystAgent.run(input);

  const [intelligenceResult, riskResult] = await Promise.all([
    intelligenceAgent.run({ ...input, agent1: agent1Result }),
    riskAgent.run({
      ...input,
      analyst: agent1Result,
    }),
  ]);

  const strategyResult = await strategyAgent.run({
    ...input,
    analyst: agent1Result,
    risk: riskResult,
  });

  const synthesisResult = await synthesisAgent.run({
    ...input,
    analyst: agent1Result,
    risk: riskResult,
    strategy: strategyResult,
  });

  return {
    analyst: agent1Result,
    risk: riskResult,
    strategy: strategyResult,
    synthesis: synthesisResult,
    intelligence: intelligenceResult,
  };
}

module.exports = {
  run,
};
