const agentOrchestrator = require("../services/agentOrchestrator");
const { insertReport } = require("../services/reportStorage");

function trimOptionalField(value) {
  if (value == null || value === "") {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

async function analyze(req, res) {
  const { job_post, client_messages, team_expertise, constraints } = req.body;

  if (!job_post || !String(job_post).trim()) {
    return res.status(400).json({ error: "job_post is required" });
  }

  const input = {
    job_post: String(job_post).trim(),
    client_messages: trimOptionalField(client_messages),
    team_expertise: trimOptionalField(team_expertise),
    constraints: trimOptionalField(constraints),
  };

  const result = await agentOrchestrator.run(input);
  return res.status(200).json(result);
}

/**
 * Same pipeline as analyze, then persists the full result for the authenticated user.
 */
async function analyzeSave(req, res) {
  const { job_post, client_messages, team_expertise, constraints, title } = req.body;

  if (!job_post || !String(job_post).trim()) {
    return res.status(400).json({ error: "job_post is required" });
  }

  const input = {
    job_post: String(job_post).trim(),
    client_messages: trimOptionalField(client_messages),
    team_expertise: trimOptionalField(team_expertise),
    constraints: trimOptionalField(constraints),
  };

  const result = await agentOrchestrator.run(input);

  const { data, error } = await insertReport({
    accessToken: req.accessToken,
    userId: req.user.id,
    title,
    result,
  });

  if (error) {
    return res.status(400).json({ error: error.message, analysis: result });
  }

  return res.status(201).json({
    report: data,
    analysis: result,
  });
}

module.exports = {
  analyze,
  analyzeSave,
};
