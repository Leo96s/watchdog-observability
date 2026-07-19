const { isOriginAllowed } = require("./corsOrigins");

describe("isOriginAllowed", () => {
  const original = process.env.FRONTEND_ORIGIN;
  afterEach(() => {
    process.env.FRONTEND_ORIGIN = original;
  });

  test("allows requests with no Origin header (curl, server-to-server)", () => {
    delete process.env.FRONTEND_ORIGIN;
    expect(isOriginAllowed(undefined)).toBe(true);
  });

  test("matches a full configured origin exactly", () => {
    process.env.FRONTEND_ORIGIN = "http://localhost:5173";
    expect(isOriginAllowed("http://localhost:5173")).toBe(true);
    expect(isOriginAllowed("http://localhost:9999")).toBe(false);
  });

  test("matches when the configured value is a full hostname without scheme", () => {
    process.env.FRONTEND_ORIGIN = "watchdog-frontend.onrender.com";
    expect(isOriginAllowed("https://watchdog-frontend.onrender.com")).toBe(true);
  });

  test("matches when the configured value is Render's bare internal service name", () => {
    process.env.FRONTEND_ORIGIN = "watchdog-frontend-m48x";
    expect(isOriginAllowed("https://watchdog-frontend-m48x.onrender.com")).toBe(true);
  });

  test("supports a comma-separated list of origins", () => {
    process.env.FRONTEND_ORIGIN = "http://localhost:5173, https://watchdog.example.com";
    expect(isOriginAllowed("http://localhost:5173")).toBe(true);
    expect(isOriginAllowed("https://watchdog.example.com")).toBe(true);
    expect(isOriginAllowed("https://evil.example.com")).toBe(false);
  });
});
