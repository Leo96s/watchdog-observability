const express = require("express");
const request = require("supertest");

jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../utils/urlSafety", () => ({ isUrlSafe: jest.fn() }));

jest.mock("../models/serviceStatus.model", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
}));

jest.mock("../models/notificationDestination.model", () => ({
  bulkCreate: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../models/alertState.model", () => ({
  destroy: jest.fn(),
}));

const { isUrlSafe } = require("../utils/urlSafety");
const ServiceStatus = require("../models/serviceStatus.model");
const servicesRouter = require("./services.routes");

const app = express();
app.use(express.json());
app.use("/api/services", servicesRouter);

const ORIGINAL_KEY = process.env.ADMIN_API_KEY;

beforeAll(() => {
  process.env.ADMIN_API_KEY = "test-key";
});

afterAll(() => {
  process.env.ADMIN_API_KEY = ORIGINAL_KEY;
});

beforeEach(() => {
  jest.clearAllMocks();
  isUrlSafe.mockResolvedValue({ safe: true });
});

describe("POST /api/services", () => {
  test("rejects requests without an API key", async () => {
    const res = await request(app)
      .post("/api/services")
      .send({ name: "Test", url: "https://example.com" });

    expect(res.status).toBe(401);
    expect(ServiceStatus.create).not.toHaveBeenCalled();
  });

  test("rejects a request missing name/url", async () => {
    const res = await request(app)
      .post("/api/services")
      .set("X-API-Key", "test-key")
      .send({ name: "Test" });

    expect(res.status).toBe(400);
  });

  test("rejects an unsafe URL (SSRF guard)", async () => {
    isUrlSafe.mockResolvedValue({ safe: false, reason: "Private/internal IP addresses are not allowed" });

    const res = await request(app)
      .post("/api/services")
      .set("X-API-Key", "test-key")
      .send({ name: "Internal", url: "http://169.254.169.254" });

    expect(res.status).toBe(400);
    expect(ServiceStatus.create).not.toHaveBeenCalled();
  });

  test("creates a service when authorized with a safe URL", async () => {
    ServiceStatus.findOne.mockResolvedValue(null);
    ServiceStatus.create.mockResolvedValue({ id: 1, serviceName: "Test", url: "https://example.com" });

    const res = await request(app)
      .post("/api/services")
      .set("X-API-Key", "test-key")
      .send({ name: "Test", url: "https://example.com" });

    expect(res.status).toBe(201);
    expect(ServiceStatus.create).toHaveBeenCalledWith(
      expect.objectContaining({ serviceName: "Test", url: "https://example.com" })
    );
  });
});

describe("DELETE /api/services/:id", () => {
  test("rejects requests without an API key", async () => {
    const res = await request(app).delete("/api/services/1");
    expect(res.status).toBe(401);
  });

  test("deactivates the service when authorized", async () => {
    const update = jest.fn();
    ServiceStatus.findByPk.mockResolvedValue({ id: 1, update });

    const res = await request(app)
      .delete("/api/services/1")
      .set("X-API-Key", "test-key");

    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ isActive: false });
  });
});

describe("GET /api/services/:id", () => {
  test("is public and returns 404 for an unknown service", async () => {
    ServiceStatus.findOne.mockResolvedValue(null);

    const res = await request(app).get("/api/services/999");

    expect(res.status).toBe(404);
  });
});
