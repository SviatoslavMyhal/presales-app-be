// Run with: node src/services/openaiService.test.js

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { chat } = require("./openaiService");

(async () => {
  try {
    const reply = await chat([
      { role: "user", content: "Reply with only the word PONG" },
    ]);
    console.log(reply);
  } catch (err) {
    console.error("Smoke test failed:", err.message);
    process.exitCode = 1;
  }
})();
