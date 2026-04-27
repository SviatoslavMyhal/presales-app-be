const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
/** Optional: used for public read-by-slug (e.g. client briefings) without exposing all rows to anon. */
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!OPENAI_API_KEY || String(OPENAI_API_KEY).trim() === "") {
  throw new Error(
    "OPENAI_API_KEY is required. Set it in your .env file (see .env.example)."
  );
}

if (!SUPABASE_URL || String(SUPABASE_URL).trim() === "") {
  throw new Error(
    "SUPABASE_URL is required for auth and reports. Set it in your .env file (see .env.example)."
  );
}

if (!SUPABASE_ANON_KEY || String(SUPABASE_ANON_KEY).trim() === "") {
  throw new Error(
    "SUPABASE_ANON_KEY is required for auth and reports. Set it in your .env file (see .env.example)."
  );
}

module.exports = {
  PORT,
  OPENAI_API_KEY,
  OPENAI_MODEL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
};
