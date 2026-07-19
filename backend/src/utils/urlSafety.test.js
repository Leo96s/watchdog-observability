const dns = require("node:dns").promises;
const { isUrlSafe } = require("./urlSafety");

jest.mock("node:dns", () => ({
  promises: { lookup: jest.fn() },
}));

describe("isUrlSafe", () => {
  test("rejects non-http(s) protocols", async () => {
    const result = await isUrlSafe("ftp://example.com");
    expect(result.safe).toBe(false);
  });

  test("rejects invalid URLs", async () => {
    const result = await isUrlSafe("not a url");
    expect(result.safe).toBe(false);
  });

  test("rejects localhost", async () => {
    const result = await isUrlSafe("http://localhost:3000");
    expect(result.safe).toBe(false);
  });

  test.each([
    "http://127.0.0.1",
    "http://10.0.0.5",
    "http://192.168.1.1",
    "http://169.254.169.254", // cloud metadata endpoint
    "http://0.0.0.0",
  ])("rejects private/loopback/link-local IP literal %s", async (url) => {
    const result = await isUrlSafe(url);
    expect(result.safe).toBe(false);
  });

  test("accepts a public IP literal", async () => {
    const result = await isUrlSafe("http://8.8.8.8");
    expect(result.safe).toBe(true);
  });

  test("rejects a hostname that resolves to a private IP", async () => {
    dns.lookup.mockResolvedValue([{ address: "10.0.0.1", family: 4 }]);
    const result = await isUrlSafe("https://internal.example.com");
    expect(result.safe).toBe(false);
  });

  test("accepts a hostname that resolves to a public IP", async () => {
    dns.lookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
    const result = await isUrlSafe("https://public.example.com");
    expect(result.safe).toBe(true);
  });

  test("rejects when DNS resolution fails", async () => {
    dns.lookup.mockRejectedValue(new Error("ENOTFOUND"));
    const result = await isUrlSafe("https://does-not-resolve.example.com");
    expect(result.safe).toBe(false);
  });
});
