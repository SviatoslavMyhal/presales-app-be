const fs = require("fs");
const path = require("path");

// helpers/ → agents/ → src/skills (not agents/skills)
const SKILLS_DIR = path.join(__dirname, "../../skills");
/** @type {Map<string, string>} */
const cache = new Map();

/**
 * Loads and caches a skill markdown file from `src/skills/`.
 * @param {string} fileName — e.g. `analyst-agent.md`
 * @returns {string}
 */
function loadSkillMarkdown(fileName) {
  const fullPath = path.join(SKILLS_DIR, fileName);
  if (!cache.has(fullPath)) {
    cache.set(fullPath, fs.readFileSync(fullPath, "utf8"));
  }
  return cache.get(fullPath);
}

/** Clears cache (e.g. for tests or hot-reload tooling). */
function clearSkillMarkdownCache() {
  cache.clear();
}

module.exports = { loadSkillMarkdown, clearSkillMarkdownCache };
