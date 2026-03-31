require("dotenv").config();
require("./src/config/env");

const app = require("./src/app");
const { PORT } = require("./src/config/env");

const BASE_URL = `http://localhost:${PORT}`;

const ENDPOINTS = [
  { method: "POST", path: "/api/presales/analyze", description: "Run presales multi-agent analysis" },
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
