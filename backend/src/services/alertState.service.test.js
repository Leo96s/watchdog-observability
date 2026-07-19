jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../models/alertState.model", () => ({
  findByPk: jest.fn(),
  create: jest.fn(),
}));

const AlertState = require("../models/alertState.model");
const { hasStateChanged } = require("./alertState.service");

describe("hasStateChanged", () => {
  beforeEach(() => jest.clearAllMocks());

  test("creates a new state and returns true when none exists yet", async () => {
    AlertState.findByPk.mockResolvedValue(null);

    const result = await hasStateChanged(1, "UP");

    expect(result).toBe(true);
    expect(AlertState.create).toHaveBeenCalledWith(
      expect.objectContaining({ serviceId: 1, lastStatus: "UP" })
    );
  });

  test("returns true and persists the change when status differs", async () => {
    const state = { lastStatus: "UP", lastChange: new Date(0), save: jest.fn() };
    AlertState.findByPk.mockResolvedValue(state);

    const result = await hasStateChanged(1, "DOWN");

    expect(result).toBe(true);
    expect(state.lastStatus).toBe("DOWN");
    expect(state.save).toHaveBeenCalled();
  });

  test("returns false when the status is unchanged", async () => {
    const state = { lastStatus: "UP", lastChange: new Date(0), save: jest.fn() };
    AlertState.findByPk.mockResolvedValue(state);

    const result = await hasStateChanged(1, "UP");

    expect(result).toBe(false);
    expect(state.save).not.toHaveBeenCalled();
  });
});
