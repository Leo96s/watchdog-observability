const dns = require("node:dns").promises;
const net = require("node:net");

/**
 * Guards against SSRF: blocks non-HTTP(S) protocols, localhost, and any
 * hostname that resolves to a private/loopback/link-local/reserved IP
 * range. Resolves DNS so a public-looking domain pointing at an internal
 * IP is also caught.
 */

function ipv4ToLong(ip) {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

const IPV4_BLOCKED_RANGES = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function isPrivateIPv4(ip) {
  const target = ipv4ToLong(ip);
  return IPV4_BLOCKED_RANGES.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (target & mask) === (ipv4ToLong(base) & mask);
  });
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local fc00::/7
  if (["fe8", "fe9", "fea", "feb"].some(p => lower.startsWith(p))) return true; // link-local fe80::/10
  if (lower.startsWith("::ffff:")) {
    const embedded = lower.slice("::ffff:".length);
    if (net.isIPv4(embedded)) return isPrivateIPv4(embedded);
  }
  return false;
}

function isPrivateIP(ip) {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true;
}

async function isUrlSafe(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "Invalid URL" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { safe: false, reason: "Only http/https URLs are allowed" };
  }

  const hostname = parsed.hostname;
  if (!hostname || hostname.toLowerCase() === "localhost") {
    return { safe: false, reason: "Localhost is not allowed" };
  }

  if (net.isIP(hostname)) {
    return isPrivateIP(hostname)
      ? { safe: false, reason: "Private/internal IP addresses are not allowed" }
      : { safe: true };
  }

  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    return { safe: false, reason: "Could not resolve hostname" };
  }

  if (addresses.length === 0) {
    return { safe: false, reason: "Could not resolve hostname" };
  }

  if (addresses.some(({ address }) => isPrivateIP(address))) {
    return { safe: false, reason: "Hostname resolves to a private/internal IP address" };
  }

  return { safe: true };
}

module.exports = { isUrlSafe };
