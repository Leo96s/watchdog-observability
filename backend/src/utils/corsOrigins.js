/**
 * Shared CORS origin check for both Express (app.js) and Socket.IO (server.js).
 *
 * FRONTEND_ORIGIN can be a full origin (e.g. "http://localhost:5173", used in
 * docker-compose/local dev) or Render's `fromService`/`property: host`
 * value, which is only the *internal* short service name (e.g.
 * "watchdog-frontend-m48x"), not the public hostname the browser's Origin
 * header actually sends ("watchdog-frontend-m48x.onrender.com"). A bare
 * name with no dot is assumed to be exactly that and gets ".onrender.com"
 * appended before comparing.
 */

function parseAllowedOrigins() {
  return (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
}

function normalizeToHost(value) {
  let host = value;
  if (!/^https?:\/\//i.test(host) && !host.includes(".")) {
    host = `${host}.onrender.com`;
  }

  try {
    return new URL(/^https?:\/\//i.test(host) ? host : `https://${host}`).host;
  } catch {
    return host;
  }
}

function isOriginAllowed(origin) {
  if (!origin) return true; // non-browser requests (curl, server-to-server, health checks)

  const originHost = normalizeToHost(origin);
  return parseAllowedOrigins().some(entry => normalizeToHost(entry) === originHost);
}

module.exports = { isOriginAllowed };
