const { supabase } = require("../services/supabaseClient");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateEmailPassword(email, password) {
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return "Invalid email";
  }
  if (!password || typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}

async function signup(req, res) {
  const { email, password } = req.body ?? {};
  const validationError = validateEmailPassword(email, password);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({
    user: data.user
      ? { id: data.user.id, email: data.user.email }
      : null,
    session: data.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
          expires_at: data.session.expires_at,
          token_type: data.session.token_type,
        }
      : null,
  });
}

async function login(req, res) {
  const { email, password } = req.body ?? {};
  const validationError = validateEmailPassword(email, password);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  return res.status(200).json({
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
    session: data.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
          expires_at: data.session.expires_at,
          token_type: data.session.token_type,
        }
      : null,
  });
}

async function me(req, res) {
  return res.status(200).json({
    user: { id: req.user.id, email: req.user.email },
  });
}

module.exports = {
  signup,
  login,
  me,
};
