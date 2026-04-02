/**
 * Intelligence Agent
 * Produces confidence score, client type detection, and suggested pitch.
 * Runs after Agent 1. Does not depend on Agents 2, 3, or 4.
 *
 * context shape:
 * {
 *   job_post, client_messages, team_expertise, constraints,
 *   agent1: { status, validation, data: { opportunity_summary, client_needs } }
 * }
 */

async function run(context) {
  // TODO: replace with real OpenAI API call using intelligenceAgent.md skill prompt
  // Prompt should include: context.job_post, context.client_messages,
  // context.team_expertise, context.constraints, context.agent1.data

  const job_post = String(context.job_post ?? "");
  const client_messages = context.client_messages == null ? "" : String(context.client_messages);
  const team_expertise = context.team_expertise == null ? "" : String(context.team_expertise);
  const constraints = context.constraints == null ? "" : String(context.constraints);

  // --- Mock: Confidence Score ---
  let score = 10.0;
  const reasons = [];

  if (!constraints || !constraints.match(/\$|budget|price|cost/i)) {
    score -= 1.0;
    reasons.push("Budget not explicitly stated — risk of mismatch");
  }
  if (!constraints || !constraints.match(/week|month|deadline|timeline|launch/i)) {
    score -= 0.8;
    reasons.push("No timeline mentioned — needs clarification");
  }
  if (!job_post.match(/node|react|vue|python|aws|api|stack|tech/i)) {
    score -= 0.8;
    reasons.push("Tech stack or requirements not specified");
  }
  if (!client_messages || client_messages.trim().length === 0) {
    score -= 0.4;
    reasons.push("No client messages provided — limited context beyond job post");
  }
  if (team_expertise && team_expertise.trim().length > 0) {
    score += 0.5;
    reasons.push("Team expertise provided — stronger positioning possible");
  }
  if (constraints && constraints.trim().length > 0) {
    score += 0.3;
  }

  score = Math.max(0, Math.min(10, parseFloat(score.toFixed(1))));

  let label;
  let color;
  if (score >= 8.0) {
    label = "Strong Signal";
    color = "green";
  } else if (score >= 5.0) {
    label = "Moderate Signal";
    color = "amber";
  } else {
    label = "Weak Signal";
    color = "red";
  }

  // --- Mock: Client Type Detection ---
  let clientType = "Non-technical Founder";
  let clientConfidence = 60;
  let warning = false;
  const signals = [];

  const text = `${job_post} ${client_messages || ""}`.toLowerCase();

  if (text.match(/erp|sap|salesforce|procurement|compliance|legal|enterprise|stakeholder/i)) {
    clientType = "Enterprise";
    clientConfidence = 81;
    signals.push("References enterprise tooling (ERP, SAP, or Salesforce)");
    signals.push("Mentions multiple stakeholders or procurement process");
  } else if (text.match(/our client|white.?label|resell|agency|retainer/i)) {
    clientType = "Agency";
    clientConfidence = 76;
    signals.push('Refers to "our client" suggesting intermediary relationship');
    signals.push("White-label or reselling context detected");
  } else if (
    text.match(/event.driven|microservice|architecture|spec|async|webhook|multi.tenant|rbac/i)
  ) {
    clientType = "Technical Founder";
    clientConfidence = 84;
    signals.push("Uses precise technical terminology (event-driven, webhooks, RBAC)");
    signals.push("References architecture and system-level design concerns");
    if (text.match(/prototype|internal build|we built|we have/i)) {
      signals.push("Mentions existing internal build — has hands-on technical experience");
    }
  } else if (
    (text.match(/3 month|three month/i) && text.match(/sap|erp|mobile app|ios.*android/i)) ||
    text.match(/unclear|not sure|something like|i don.t know/i)
  ) {
    clientType = "Chaotic / unclear";
    clientConfidence = 45;
    warning = true;
    signals.push("Contradictory signals: unrealistic scope-to-timeline ratio detected");
    signals.push("No clear decision maker or technical lead identified");
  } else {
    clientType = "Non-technical Founder";
    clientConfidence = 67;
    signals.push("Describes desired outcomes rather than technical implementation");
    signals.push("No precise technical terminology — likely non-technical background");
  }

  // --- Mock: Suggested Pitch ---
  const domainHint = text.match(/saas|platform/i)
    ? "SaaS platforms"
    : text.match(/e.?commerce|shop/i)
      ? "e-commerce solutions"
      : text.match(/ai|gpt|llm|transcript|whisper/i)
        ? "AI-powered products"
        : text.match(/mobile|ios|android/i)
          ? "mobile applications"
          : "complex web applications";

  const teamHint =
    team_expertise && team_expertise.trim().length > 0
      ? team_expertise.split(".")[0]
      : `We've delivered production-ready ${domainHint}`;

  const suggestedPitch = {
    opening: `${teamHint} — and what we've learned is that the first two weeks of any engagement determine whether the project succeeds or accumulates technical debt.`,
    differentiator: team_expertise
      ? `Our background in ${domainHint} means we can move fast without cutting corners — we've already solved most of the hard problems you're about to face.`
      : `We specialize in ${domainHint} and bring a structured discovery phase that surfaces scope gaps before a single line of code is written.`,
    hook: `We don't just build what you ask for — we tell you when what you're asking for needs to change.`,
  };

  return {
    status: "success",
    error: null,
    data: {
      confidence: {
        score,
        label,
        color,
        reasons,
      },
      client_type: {
        type: clientType,
        confidence_pct: clientConfidence,
        warning,
        signals,
      },
      suggested_pitch: suggestedPitch,
    },
  };
}

module.exports = { run };
