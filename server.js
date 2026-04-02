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
