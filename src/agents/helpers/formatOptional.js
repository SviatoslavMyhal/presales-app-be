/**
 * Formats optional pipeline fields for prompts: empty → "(none)", objects → pretty JSON.
 * @param {unknown} value
 * @returns {string}
 */
function formatOptional(value) {
  if (value == null) {
    return "(none)";
  }
  if (typeof value === "string") {
    const s = value.trim();
    return s === "" ? "(none)" : s;
  }
  return JSON.stringify(value, null, 2);
}

module.exports = { formatOptional };
