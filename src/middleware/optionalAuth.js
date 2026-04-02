const { createClientWithUserAccessToken } = require("../services/supabaseClient");

/**
 * If `Authorization: Bearer <token>` is present, validates the Supabase JWT and sets
 * `req.user` and `req.accessToken`. If the header is missing, continues anonymously.
 * If a Bearer token is present but invalid or expired, responds with 401.
 */
async function optionalAuth(req, res, next) {
  req.user = null;
  req.accessToken = null;

  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== "string") {
    return next();
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return next();
  }

  const token = match[1].trim();
  if (!token) {
    return next();
  }

  const supabase = createClientWithUserAccessToken(token);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = { id: user.id, email: user.email };
  req.accessToken = token;
  next();
}

module.exports = optionalAuth;
