/**
 * Proposal Agent
 * Generates a personalized proposal draft from the completed presales report.
 *
 * context shape:
 * {
 *   synthesis_report: SynthesisReport,
 *   intelligence: IntelligenceData,
 *   job_post: string,
 *   client_messages?: string,
 *   team_expertise?: string,
 *   constraints?: string,
 *   sender_name?: string,
 *   company_name?: string,
 * }
 */

async function run(context) {
  // TODO: replace mock with real OpenAI call using proposalAgent.md skill
  // Pass full context as structured prompt input
  // Expect JSON response matching the output shape in the skill file

  const {
    synthesis_report,
    intelligence,
    job_post,
    client_messages = "",
    team_expertise = "",
    constraints = "",
    sender_name = "",
    company_name = "",
  } = context;

  const sr =
    synthesis_report &&
    typeof synthesis_report === "object" &&
    synthesis_report.report != null
      ? synthesis_report.report
      : synthesis_report;

  const intel = intelligence?.data ?? intelligence ?? null;

  const jobPostStr = String(job_post ?? "");

  const titleWords = jobPostStr
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const projectTitle = titleWords || "Your Project";
  const companyLabel = company_name?.trim() || "Our Team";
  const senderLabel = sender_name?.trim() || "The Team";
  const signatureLine = company_name?.trim()
    ? `${senderLabel}\n${company_name.trim()}`
    : senderLabel;

  let greeting = "Hi there,";
  if (client_messages) {
    const nameMatch = client_messages.match(
      /(?:i'?m|my name is|this is)\s+([A-Z][a-z]+)/i
    );
    if (nameMatch) {
      greeting = `Hi ${nameMatch[1]},`;
    }
  }

  const tone = sr?.call_strategy?.tone || "consultative";
  const closingMap = {
    consultative: "Looking forward to exploring this together.",
    technical: "Happy to go deeper on the technical side whenever you're ready.",
    reassuring: "We're here to make this straightforward for you.",
    exploratory: "Excited to hear more about where you want to take this.",
  };
  const closing = closingMap[tone] || closingMap.consultative;

  const mainNeed = sr?.client_needs?.main_need || "";
  const hiddenNeeds = sr?.client_needs?.hidden_needs || [];
  const solutionApproach = sr?.solution_approach || [];
  const desiredOutcome = sr?.call_strategy?.desired_outcome || "";
  const confidenceScore = intel?.confidence?.score ?? 0;
  const differentiator = intel?.suggested_pitch?.differentiator || "";

  const section1 = [
    `From what you've shared, you're looking to ${mainNeed
      .replace(/^The client needs to /i, "")
      .replace(/^The client needs /i, "") || "build something meaningful"}.`,
    confidenceScore >= 6.0 && hiddenNeeds.length > 0
      ? `We also picked up on a deeper priority: ${String(hiddenNeeds[0])
          .toLowerCase()
          .replace(/\.$/, "")}.`
      : null,
    `We've read through the full brief and have a clear picture of what success looks like for this engagement.`,
  ]
    .filter(Boolean)
    .join(" ");

  const approachPoints = solutionApproach
    .slice(0, 3)
    .map((p) => (p && typeof p === "object" ? p.point || p : p))
    .filter(Boolean);

  const section2 =
    approachPoints.length > 0
      ? `Our approach starts with ${String(approachPoints[0])
          .toLowerCase()
          .replace(/\.$/, "")}. From there, we ${
          approachPoints[1]
            ? String(approachPoints[1]).toLowerCase().replace(/\.$/, "")
            : "move into structured delivery with regular checkpoints"
        }. ${approachPoints[2] ? `${approachPoints[2]}.` : ""} ${
          constraints
            ? `We've factored in your constraints — ${String(constraints).slice(0, 80)}.`
            : ""
        }`.trim()
      : `We'd begin with a focused discovery session to align on scope and technical decisions, followed by phased delivery with clear milestones. Every decision gets documented so nothing gets lost between conversations.`;

  const section3 = differentiator
    ? differentiator
    : team_expertise
      ? `${String(team_expertise).split(".")[0].trim()}. This directly maps to what you need here.`
      : `We've worked on projects with a similar combination of technical depth and delivery pressure, and we know where these engagements typically go wrong — which means we can prevent it.`;

  const section4 = `${
    desiredOutcome
      ? `Our goal for an initial call would be: ${String(desiredOutcome)
          .toLowerCase()
          .replace(/\.$/, "")}.`
      : "We'd love to set up a short discovery call to align on scope and answer any questions you have."
  } Would a 30-minute call this week work for you?`;

  const allText = [section1, section2, section3, section4, closing].join(" ");
  const wordCount = allText.split(/\s+/).filter(Boolean).length;
  const readTimeSeconds = Math.round((wordCount / 200) * 60);

  return {
    status: "success",
    error: null,
    data: {
      subject: `Proposal: ${projectTitle} — ${companyLabel}`,
      greeting,
      sections: [
        { title: "What We Understood", content: section1 },
        { title: "Our Approach", content: section2 },
        { title: "Why Us", content: section3 },
        { title: "Next Steps", content: section4 },
      ],
      closing,
      signature: signatureLine,
      meta: {
        estimated_read_time_seconds: readTimeSeconds,
        tone,
        word_count: wordCount,
      },
    },
  };
}

module.exports = { run };
