const smartBriefingAgent = require("../agents/smartBriefingAgent");
const { insertBriefing } = require("../services/briefingStorage");

function optStr(v) {
  if (v == null || v === "") return "";
  return typeof v === "string" ? v.trim() : String(v);
}

/**
 * Generates client-facing pre-call briefing JSON and stores it with a public slug.
 */
async function create(req, res) {
  const {
    synthesis_report,
    intelligence,
    job_post,
    client_messages,
    team_expertise,
    constraints,
  } = req.body ?? {};

  if (!synthesis_report) {
    return res.status(400).json({ error: "synthesis_report is required" });
  }
  if (!job_post || !String(job_post).trim()) {
    return res.status(400).json({ error: "job_post is required" });
  }

  const agentResult = await smartBriefingAgent.run({
    synthesis_report,
    intelligence: intelligence ?? null,
    job_post: String(job_post).trim(),
    client_messages: optStr(client_messages),
    team_expertise: optStr(team_expertise),
    constraints: optStr(constraints),
  });

  if (agentResult.status !== "success" || !agentResult.data) {
    return res.status(200).json(agentResult);
  }

  const payload = {
    job_post: String(job_post).trim(),
    briefing: agentResult.data,
    generated_at: new Date().toISOString(),
  };

  const { data, error } = await insertBriefing({
    accessToken: req.accessToken,
    userId: req.user.id,
    payload,
  });

  if (error) {
    return res.status(400).json({ error: error.message, briefing: agentResult });
  }

  return res.status(201).json({
    briefing: agentResult,
    share: {
      slug: data.slug,
      path: `/api/public/briefings/${data.slug}`,
    },
    row: data,
  });
}

module.exports = { create };
