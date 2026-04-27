const followUpAgent = require("../agents/followUpAgent");

function optStr(v) {
  if (v == null || v === "") return "";
  return typeof v === "string" ? v.trim() : String(v);
}

async function generate(req, res) {
  const {
    discussed_summary,
    next_step,
    red_flags,
    client_name,
    job_post,
    synthesis_report,
  } = req.body ?? {};

  if (!discussed_summary || !String(discussed_summary).trim()) {
    return res.status(400).json({ error: "discussed_summary is required" });
  }
  if (!next_step || !String(next_step).trim()) {
    return res.status(400).json({ error: "next_step is required" });
  }

  const result = await followUpAgent.run({
    discussed_summary: String(discussed_summary).trim(),
    next_step: String(next_step).trim(),
    red_flags: optStr(red_flags),
    client_name: optStr(client_name),
    job_post: optStr(job_post),
    synthesis_report: synthesis_report ?? null,
  });

  return res.status(200).json(result);
}

module.exports = { generate };
