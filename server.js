require("dotenv").config();
require("./src/config/env");

const app = require("./src/app");
const { PORT } = require("./src/config/env");

const BASE_URL = `http://localhost:${PORT}`;

const ENDPOINTS = [
  { method: "POST", path: "/api/auth/signup", description: "Sign up (email + password)" },
  { method: "POST", path: "/api/auth/login", description: "Sign in (email + password)" },
  { method: "GET", path: "/api/auth/me", description: "Current user (requires Bearer token)" },
  { method: "POST", path: "/api/reports", description: "Save a report JSON (requires Bearer)" },
  { method: "GET", path: "/api/reports", description: "List my reports (requires Bearer)" },
  { method: "GET", path: "/api/reports/:id", description: "Get one report (requires Bearer)" },
  { method: "DELETE", path: "/api/reports/:id", description: "Delete one report (requires Bearer)" },
  {
    method: "GET",
    path: "/api/analytics/summary",
    description: "Aggregated analytics from current user's Supabase reports (requires Bearer)",
  },
  { method: "POST", path: "/api/presales/analyze", description: "Run presales analysis (anonymous)" },
  {
    method: "POST",
    path: "/api/presales/analyze/save",
    description: "Run analysis and save report (requires Bearer)",
  },
  {
    method: "POST",
    path: "/api/proposal/generate",
    description: "Generate proposal draft from synthesis + intelligence (standalone)",
  },
  {
    method: "POST",
    path: "/api/presales/prescreen",
    description: "Fast red-flag triage before full analysis (no auth)",
  },
  {
    method: "POST",
    path: "/api/call-script/generate",
    description: "Timed discovery call script from synthesis + intelligence",
  },
  {
    method: "POST",
    path: "/api/objections/generate",
    description: "Likely objections and responses from report context",
  },
  {
    method: "POST",
    path: "/api/competitors/generate",
    description: "Competitor archetypes and positioning lines",
  },
  {
    method: "POST",
    path: "/api/follow-up/generate",
    description: "Post-call follow-up email from notes",
  },
  {
    method: "POST",
    path: "/api/briefings",
    description: "Create shareable client briefing (requires Bearer)",
  },
  {
    method: "GET",
    path: "/api/public/briefings/:slug",
    description: "Fetch public briefing JSON by slug (service role on server)",
  },
  { method: "POST", path: "/api/deal/analyze", description: "PreSalesAI: full pipeline + insights (TS module)" },
  { method: "POST", path: "/api/deal/questions", description: "PreSalesAI: categorized discovery questions" },
  { method: "POST", path: "/api/deal/solution", description: "PreSalesAI: solution variants (fast vs scalable)" },
  { method: "POST", path: "/api/deal/risks", description: "PreSalesAI: psychology / risk lens" },
  { method: "GET", path: "/api/deal/:id/insights", description: "PreSalesAI: stored insights for deal id" },
  { method: "GET", path: "/api/deal/memory/recent", description: "PreSalesAI: recent deal fingerprints" },
  { method: "GET", path: "/api/deal/memory/similar", description: "PreSalesAI: similar past deals (?q=)" },
  { method: "POST", path: "/api/call/live-assist", description: "PreSalesAI: structured live assist from transcript" },
  { method: "POST", path: "/api/call/live-assist/stream", description: "PreSalesAI: SSE token stream for live assist" },
];

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`\n  Local:   ${BASE_URL}\n`);
  console.log("  Available endpoints:");
  for (const ep of ENDPOINTS) {
    console.log(`    ${ep.method.padEnd(6)} ${ep.path}`);
    if (ep.description) {
      console.log(`           ${ep.description}`);
    }
  }
  console.log();
});
