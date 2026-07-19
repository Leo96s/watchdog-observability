const logger = require("../utils/logger");

/**
 * Protects mutating routes with a static API key. Fails closed if
 * ADMIN_API_KEY isn't configured, instead of silently allowing writes.
 */
function apiKeyAuth(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    logger.error("ADMIN_API_KEY is not configured; rejecting write request");
    return res.status(500).json({ error: "Server is not configured for write access" });
  }

  const provided = req.get("X-API-Key");
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }

  next();
}

module.exports = { apiKeyAuth };
