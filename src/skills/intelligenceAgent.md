# Intelligence Agent Skill

## Purpose
Analyzes presales input to produce three high-value intelligence signals:
1. Confidence Score with explainability
2. Client Type Detection
3. Suggested Pitch

This agent runs after Agent 1 (Analyst) and receives both the raw user input and
Agent 1's structured output as context.

## Input shape
```
context.job_post          — required, main project description
context.client_messages   — optional, raw client messages
context.team_expertise    — optional, team background
context.constraints       — optional, budget/timeline/engagement constraints
context.agent1            — Agent 1 output (opportunity_summary + client_needs)
```

## Output shape
```json
{
  "confidence": {
    "score": 7.8,
    "label": "Strong Signal",
    "color": "green",
    "reasons": [
      "Clear product vision with defined V1 scope",
      "Budget not explicitly stated — risk of mismatch",
      "No timeline mentioned — needs clarification",
      "Strong technical context present"
    ]
  },
  "client_type": {
    "type": "Technical Founder",
    "confidence_pct": 84,
    "warning": false,
    "signals": [
      "References system-level product spec",
      "Uses terms like event-driven and asynchronous",
      "Emphasizes architectural quality over speed"
    ]
  },
  "suggested_pitch": {
    "opening": "We've built three SaaS platforms from spec to production...",
    "differentiator": "Unlike most teams who jump straight to code, we start with a structured discovery phase...",
    "hook": "We don't just build what you ask — we tell you when what you're asking for needs to change."
  }
}
```

## Confidence Score rules
- Score range: 0.0 – 10.0 (one decimal)
- Label mapping:
  - 8.0–10.0 → "Strong Signal", color "green"
  - 5.0–7.9  → "Moderate Signal", color "amber"
  - 0.0–4.9  → "Weak Signal", color "red"
- Score is calculated by penalizing missing or vague signals:
  - No budget mentioned: -1.0
  - No timeline mentioned: -0.8
  - No tech stack or requirements: -0.8
  - Vague or contradictory scope: -1.2
  - No client messages provided: -0.4
  - Chaotic or unclear client type: -0.8
  - Presence of team_expertise provided: +0.5
  - Presence of constraints provided: +0.3
- Start from base score 10.0, apply penalties and bonuses, clamp to 0–10
- reasons array: list only the factors that actually affected the score (2–5 items)
  each reason is one plain sentence, specific to this input

## Client Type Detection rules
- Possible types (use exactly these strings):
  - "Technical Founder"
  - "Non-technical Founder"
  - "Enterprise"
  - "Agency"
  - "Chaotic / unclear"
- warning: true only when type is "Chaotic / unclear"
- confidence_pct: 0–100, reflects how clearly the signals point to the type
- signals: 2–4 short sentences quoting or paraphrasing actual evidence from the input
- Detection heuristics:
  - Technical Founder: uses precise technical terminology, references architecture,
    mentions own prototype or internal build, small team context
  - Non-technical Founder: describes outcomes not implementation, uses vague tech
    references, mentions designer/agency dependencies
  - Enterprise: mentions ERP/SAP/Salesforce, compliance, procurement, legal review,
    large team, multiple stakeholders, existing vendor contracts
  - Agency: mentions "our client", reselling context, white-label, multiple projects,
    mentions existing client relationship
  - Chaotic / unclear: contradictory signals, extremely vague scope, unrealistic
    combinations (e.g. 3 months + SAP integration + mobile app + 50k users),
    no clear decision maker identified

## Suggested Pitch rules
- opening: 1–2 sentences. Must reference something specific from this engagement
  (domain, scale, tech, challenge). Never generic. Start with "We've" or "Our team has".
- differentiator: 1–2 sentences. What makes YOUR team the right fit for THIS client
  specifically. Use team_expertise if provided, otherwise infer from job_post context.
- hook: exactly 1 sentence. Punchy, memorable, slightly provocative.
  Should feel like something a confident senior consultant would say.
- All three fields must feel connected — they should read as a natural 3-part intro
  if spoken aloud in sequence on a discovery call.
  - opening:
  - 1–2 sentences
  - MUST reference specific signals from this project
  - MUST NOT be generic or reusable
  - MUST NOT follow a fixed pattern (e.g. "We've built...")

- differentiator:
  - Must explain WHY this team fits THIS project specifically
  - MUST reference either:
    - team_expertise (if provided)
    - or inferred complexity from job_post
  - Avoid generic claims (e.g. "we build scalable apps")

- hook:
  - exactly 1 sentence
  - must be specific, slightly opinionated
  - must relate to a real risk or insight from this case
  - avoid cliché consultant phrases

## Anti-Template Rules (CRITICAL)
- The example output provided in this document is for structure reference ONLY.
- You MUST NOT reuse or copy phrases from the example.
- You MUST generate original wording every time.
- Avoid generic phrases like:
  - "We've built X platforms..."
  - "Unlike most teams..."
  - "We don't just build..."
- If the generated pitch could apply to ANY project, it is WRONG.
- Every output must clearly reflect THIS specific client context.