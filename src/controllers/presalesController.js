const agentOrchestrator = require("../services/agentOrchestrator");

async function analyze(req, res) {
  const { job_post, client_messages, team_expertise, constraints } = req.body;

  if (job_post == null || job_post === "") {
    return res.status(400).json({ error: "job_post is required" });
  }

  const input = {
    job_post,
    client_messages,
    team_expertise,
    constraints,
  };

  const result = await agentOrchestrator.run(input);
  return res.status(200).json(result);
}

module.exports = {
  analyze,
};
