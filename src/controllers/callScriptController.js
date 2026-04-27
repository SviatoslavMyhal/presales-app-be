const callScriptAgent = require("../agents/callScriptAgent");

function optStr(v) {
  if (v == null || v === "") return "";
  return typeof v === "string" ? v.trim() : String(v);
}

async function generate(req, res) {
  const {
    synthesis_report,
    intelligence,
    job_post,
    client_messages,
    team_expertise,
    constraints,
    risk,
    strategy,
  } = req.body ?? {};

  if (!synthesis_report) {
    return res.status(400).json({ error: "synthesis_report is required" });
  }
  if (!job_post || !String(job_post).trim()) {
    return res.status(400).json({ error: "job_post is required" });
  }

  const result = await callScriptAgent.run({
    synthesis_report,
    intelligence: intelligence ?? null,
    job_post: String(job_post).trim(),
    client_messages: optStr(client_messages),
    team_expertise: optStr(team_expertise),
    constraints: optStr(constraints),
    risk: risk ?? null,
    strategy: strategy ?? null,
  });

  return res.status(200).json(result);
}

module.exports = { generate };
