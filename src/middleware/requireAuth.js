/**
 * Requires `optionalAuth` to have set `req.user`. Use after `optionalAuth`.
 */
function requireAuth(req, res, next) {
  if (!req.user || !req.accessToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

module.exports = requireAuth;
