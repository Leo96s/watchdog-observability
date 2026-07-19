/**
 * Shared CORS origin check for both Express (app.js) and Socket.IO (server.js).
 *
 * FRONTEND_ORIGIN can be a full origin (e.g. "http://localhost:5173", used in
 * docker-compose/local dev) or a bare hostname (Render's `fromService`
 * `property: host` only returns the hostname, no scheme). Both forms are
 * normalized to just the host before comparing, so either works.
 */

function parseAllowedOrigins() {
  return (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
}

function normalizeToHost(value) {
  try {
    return new URL(value).host;
  } catch {
    return value; // already a bare hostname, e.g. "my-app.onrender.com"
  }
}

function isOriginAllowed(origin) {
  if (!origin) return true; // non-browser requests (curl, server-to-server, health checks)

  const originHost = normalizeToHost(origin);
  return parseAllowedOrigins().some(entry => normalizeToHost(entry) === originHost);
}

module.exports = { isOriginAllowed };
