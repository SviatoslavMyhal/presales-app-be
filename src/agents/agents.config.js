/**
 * Per-agent defaults: skill file, envelope key, reminder suffix, extra OpenAI options.
 * Keep agent-specific copy here; keep behavior in `helpers/runJsonAgent.js`.
 */
module.exports = {
  analyst: {
    skillFileName: "analyst-agent.md",
    agentKey: "analyst",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the schema. No markdown, no text outside JSON.",
    chatOptions: {},
  },
  risk: {
    skillFileName: "risk-discovery-agent.md",
    agentKey: "risk",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the schema. No markdown, no narrative summary, no text outside JSON.",
    chatOptions: {},
  },
  strategy: {
    skillFileName: "strategy-agent.md",
    agentKey: "strategy",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the schema. No markdown, no consolidated prose, no text outside JSON.",
    chatOptions: {},
  },
  synthesis: {
    skillFileName: "synthesis-agent.md",
    agentKey: "synthesis",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the schema. Assemble sections 1–7 from upstream JSON; do not output markdown sections. No text outside JSON.",
    chatOptions: { max_tokens: 4096 },
  },
  intelligence: {
    skillFileName: "intelligenceAgent.md",
    agentKey: "intelligence",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the Output shape in the skill. Top-level keys: confidence, client_type, suggested_pitch. No markdown, no text outside JSON.",
    chatOptions: {},
  },
  proposal: {
    skillFileName: "proposalAgent.md",
    agentKey: "proposal",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the Output shape in the skill. Top-level keys: subject, greeting, sections, closing, signature, meta. No markdown, no text outside JSON.",
    chatOptions: { max_tokens: 4096 },
  },
  callScript: {
    skillFileName: "callScriptAgent.md",
    agentKey: "call_script",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the Output shape. Top-level key: phases (array). No markdown, no text outside JSON.",
    chatOptions: { max_tokens: 4096 },
  },
  objection: {
    skillFileName: "objectionAgent.md",
    agentKey: "objection",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the Output shape. Top-level key: objections (array, 5–7 items). No markdown, no text outside JSON.",
    chatOptions: { max_tokens: 4096 },
  },
  preScreen: {
    skillFileName: "preScreenAgent.md",
    agentKey: "pre_screen",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the Output shape. No markdown, no text outside JSON.",
    chatOptions: { max_tokens: 1200 },
  },
  competitor: {
    skillFileName: "competitorAgent.md",
    agentKey: "competitor",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the Output shape. Top-level key: scenarios. No markdown, no text outside JSON.",
    chatOptions: { max_tokens: 2048 },
  },
  followUp: {
    skillFileName: "followUpAgent.md",
    agentKey: "follow_up",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object with subject and body. No markdown, no text outside JSON.",
    chatOptions: { max_tokens: 2048 },
  },
  smartBriefing: {
    skillFileName: "smartBriefingAgent.md",
    agentKey: "smart_briefing",
    reminder:
      "\n\nReminder: Your entire reply must be a single JSON object matching the Output shape. No markdown, no text outside JSON.",
    chatOptions: { max_tokens: 4096 },
  },
};
