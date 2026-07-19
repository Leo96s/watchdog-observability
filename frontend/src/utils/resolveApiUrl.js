/**
 * Normalizes VITE_API_URL into a bare origin (scheme + host, no trailing
 * slash or /api suffix).
 *
 * Render's fromService/property:host returns the *internal* short service
 * name only (e.g. "watchdog-backend-dvx5"), not a resolvable public
 * hostname - the browser needs "watchdog-backend-dvx5.onrender.com". A bare
 * name with no dot is assumed to be exactly that and gets ".onrender.com"
 * appended. This also tolerates a value that already includes a trailing
 * /api (an older local-dev convention), so either form works without
 * producing a double "/api/api" or an unresolvable baseURL.
 */
export function resolveApiOrigin(rawUrl) {
  if (!rawUrl) return rawUrl;

  let host = rawUrl;
  if (!/^https?:\/\//i.test(host) && !host.includes(".")) {
    host = `${host}.onrender.com`;
  }

  let url = /^https?:\/\//i.test(host) ? host : `https://${host}`;
  url = url.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "");
  return url;
}
