const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

if (!OPENAI_API_KEY || String(OPENAI_API_KEY).trim() === "") {
  throw new Error(
    "OPENAI_API_KEY is required. Set it in your .env file (see .env.example)."
  );
}

module.exports = {
  PORT,
  ANTHROPIC_API_KEY,
  OPENAI_API_KEY,
  OPENAI_MODEL,
};
