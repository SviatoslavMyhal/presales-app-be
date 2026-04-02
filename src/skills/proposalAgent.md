# Proposal Agent Skill

## Purpose
Generates a professional, personalized proposal draft that a freelancer or agency
can send to a client after a presales discovery call. The output is ready-to-send
with minimal editing — not a template, a real first draft.

## Input shape
```
context.synthesis_report   — full synthesis report from the main pipeline
context.intelligence        — intelligence data (confidence, client_type, suggested_pitch)
context.job_post            — original project description
context.client_messages     — optional client messages
context.team_expertise      — optional team background
context.constraints         — optional constraints (budget, timeline, etc.)
context.sender_name         — optional: name of the person sending the proposal
context.company_name        — optional: agency or freelancer name
```

## Output shape
```json
{
  "subject": "Proposal: [Project Title] — [Company Name]",
  "greeting": "Hi [client name or 'there' if unknown],",
  "sections": [
    {
      "title": "What We Understood",
      "content": "..."
    },
    {
      "title": "Our Approach",
      "content": "..."
    },
    {
      "title": "Why Us",
      "content": "..."
    },
    {
      "title": "Next Steps",
      "content": "..."
    }
  ],
  "closing": "Looking forward to discussing this further.",
  "signature": "[sender_name]\n[company_name]",
  "meta": {
    "estimated_read_time_seconds": 45,
    "tone": "consultative",
    "word_count": 180
  }
}
```

## Section generation rules

### Subject line
- Format: "Proposal: {3–5 word project title derived from job_post} — {company_name or 'Our Team'}"
- Project title must be specific — not "Your Project" or "Web Application"
- Example: "Proposal: SaaS Automation Platform V1 — Devstack Agency"

### Greeting
- If client name is detectable from client_messages or job_post — use it: "Hi Sarah,"
- If not detectable — use: "Hi there,"
- Never use "Dear Sir/Madam" or "To Whom It May Concern"

### Section 1 — "What We Understood"
- 2–3 sentences summarizing what the client wants to build
- Source: synthesis_report.opportunity_summary + client_needs.main_need
- Must feel like YOU understood THEM — not a copy-paste of their description
- Start with "You're looking to..." or "From what you've shared..."
- Include 1 hidden need if confidence is high enough (score ≥ 6.0)

### Section 2 — "Our Approach"
- 3–4 sentences describing HOW you would tackle this
- Source: synthesis_report.solution_approach (top 2–3 points)
- Be specific: mention phases, key decisions, or technical approach
- Reference constraints if provided (timeline, budget model)
- Do NOT use bullet points — flowing prose only

### Section 3 — "Why Us"
- 2–3 sentences on team fit for this specific engagement
- Source: intelligence.suggested_pitch.differentiator + team_expertise
- If team_expertise is empty — derive from job_post domain context
- Must reference something specific about THIS project, not generic claims

### Section 4 — "Next Steps"
- 2 sentences maximum
- Propose a concrete next action: discovery call, short audit, or scoping session
- Reference the call_strategy.desired_outcome if available
- End with an open question to invite response

### Closing
- One warm, professional sentence
- Matches the tone from synthesis_report.call_strategy.tone:
  - consultative → "Looking forward to exploring this together."
  - technical → "Happy to go deeper on the technical side whenever you're ready."
  - reassuring → "We're here to make this straightforward for you."
  - exploratory → "Excited to hear more about where you want to take this."

### Signature
- Format: "{sender_name}\n{company_name}" 
- If sender_name is empty: use "The Team"
- If company_name is empty: omit second line

## Tone rules
- Match tone from synthesis_report.call_strategy.tone
- Never use: "leverage", "synergy", "cutting-edge", "world-class", "passionate"
- Avoid filler phrases: "I hope this email finds you well", "Please don't hesitate"
- Write like a confident senior consultant — direct, warm, specific
- Total word count target: 150–220 words across all sections
- Reading time must be honest — calculate as word_count / 200 * 60 seconds

## Quality checklist (verify before returning output)
- [ ] Subject line references actual project domain
- [ ] Greeting uses client name if detectable
- [ ] Section 1 references at least one specific detail from the input
- [ ] Section 2 mentions at least one concrete phase or technical decision
- [ ] Section 3 is specific to this project — not generic
- [ ] Section 4 ends with an open question
- [ ] No bullet points in any section content
- [ ] Word count between 150–220
- [ ] Tone matches call_strategy.tone
