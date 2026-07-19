jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const { apiKeyAuth } = require("./apiKeyAuth.middleware");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("apiKeyAuth", () => {
  const originalKey = process.env.ADMIN_API_KEY;

  afterEach(() => {
    process.env.ADMIN_API_KEY = originalKey;
  });

  test("fails closed with 500 when ADMIN_API_KEY is not configured", () => {
    delete process.env.ADMIN_API_KEY;
    const req = { get: () => undefined };
    const res = mockRes();
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects requests without an API key", () => {
    process.env.ADMIN_API_KEY = "secret";
    const req = { get: () => undefined };
    const res = mockRes();
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects requests with a wrong API key", () => {
    process.env.ADMIN_API_KEY = "secret";
    const req = { get: () => "wrong" };
    const res = mockRes();
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next() when the API key matches", () => {
    process.env.ADMIN_API_KEY = "secret";
    const req = { get: () => "secret" };
    const res = mockRes();
    const next = jest.fn();

    apiKeyAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
