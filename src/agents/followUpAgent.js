const { runJsonAgent } = require("./helpers/runJsonAgent");
const userMessages = require("./helpers/userMessages");
const config = require("./agents.config");

function normalize(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      status: "error",
      error: "Follow-up agent returned empty output",
      code: "FOLLOW_UP_EMPTY",
    };
  }
  if (raw.status === "error") {
    return raw;
  }
  const inner =
    raw.data != null && raw.data.subject != null
      ? raw.data
      : raw.subject != null
        ? raw
        : null;
  if (!inner || inner.body == null) {
    return {
      status: "error",
      error: "Follow-up output missing subject or body.",
      code: "FOLLOW_UP_SCHEMA",
      agent: "follow_up",
    };
  }
  return {
    status: "success",
    error: null,
    data: {
      subject: inner.subject,
      body: inner.body,
      meta: inner.meta ?? {},
    },
  };
}

async function run(context) {
  const raw = await runJsonAgent(context, {
    ...config.followUp,
    buildUserMessage: userMessages.followUp,
  });
  return normalize(raw);
}

module.exports = { run };
