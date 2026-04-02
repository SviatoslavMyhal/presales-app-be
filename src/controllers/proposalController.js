const proposalAgent = require("../agents/proposalAgent");

async function generate(req, res) {
  const {
    synthesis_report,
    intelligence,
    job_post,
    client_messages,
    team_expertise,
    constraints,
    sender_name,
    company_name,
  } = req.body;

  if (!synthesis_report) {
    return res.status(400).json({ error: "synthesis_report is required" });
  }
  if (!job_post) {
    return res.status(400).json({ error: "job_post is required" });
  }

  const result = await proposalAgent.run({
    synthesis_report,
    intelligence,
    job_post,
    client_messages: client_messages ?? "",
    team_expertise: team_expertise ?? "",
    constraints: constraints ?? "",
    sender_name: sender_name ?? "",
    company_name: company_name ?? "",
  });

  return res.status(200).json(result);
}

module.exports = {
  generate,
};
