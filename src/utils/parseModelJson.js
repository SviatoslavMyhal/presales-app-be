/**
 * Extract a balanced top-level JSON object from text (ignores braces inside strings).
 */
function extractJsonObject(s) {
  const start = s.indexOf("{");
  if (start === -1) {
    return null;
  }
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === "\\") {
        escape = true;
      } else if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") {
      depth += 1;
    } else if (c === "}") {
      depth -= 1;
      if (depth === 0) {
        return s.slice(start, i + 1);
      }
    }
  }
  return null;
}

function parseModelJson(text) {
  const trimmed = String(text).trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/m);
  const candidates = [];
  if (fence) {
    candidates.push(fence[1].trim());
  }
  candidates.push(trimmed);

  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch {
      // try next candidate
    }
  }

  const extracted = extractJsonObject(trimmed);
  if (extracted) {
    return JSON.parse(extracted);
  }

  throw new Error("Invalid JSON");
}

const EXCERPT_MAX = 4000;

function buildParseErrorEnvelope(agentKey, text) {
  const excerpt = String(text).trim();
  return {
    status: "error",
    error: `Agent "${agentKey}" could not parse model output as JSON. Ensure JSON-only replies (no markdown or prose).`,
    code: "MODEL_OUTPUT_PARSE_ERROR",
    agent: agentKey,
    model_output_excerpt:
      excerpt.length > EXCERPT_MAX
        ? `${excerpt.slice(0, EXCERPT_MAX)}…`
        : excerpt,
  };
}

/**
 * Parses model text to an object, or returns a structured error envelope (never `{ raw: "..." }`).
 */
function parseJsonOrEnvelope(agentKey, text) {
  try {
    return parseModelJson(text);
  } catch {
    return buildParseErrorEnvelope(agentKey, text);
  }
}

module.exports = {
  parseModelJson,
  parseJsonOrEnvelope,
  buildParseErrorEnvelope,
};
