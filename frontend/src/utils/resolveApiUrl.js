/**
 * Normalizes VITE_API_URL into a bare origin (scheme + host, no trailing
 * slash or /api suffix). Render's fromService/property:host only returns a
 * hostname with no scheme, and this also tolerates a value that already
 * includes a trailing /api (an older local-dev convention), so either form
 * works without producing a double "/api/api" or a schemeless baseURL.
 */
export function resolveApiOrigin(rawUrl) {
  if (!rawUrl) return rawUrl;

  let url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  url = url.replace(/\/+$/, "");
  url = url.replace(/\/api$/i, "");
  return url;
}
