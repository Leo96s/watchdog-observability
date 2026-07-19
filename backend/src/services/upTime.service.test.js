jest.mock("../models/serviceLog.model", () => ({
  count: jest.fn(),
  findAll: jest.fn(),
}));

const ServiceLog = require("../models/serviceLog.model");
const { calculateUptime, calculateUptimeForAll } = require("./upTime.service");

describe("calculateUptime", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 100 when there are no checks", async () => {
    ServiceLog.count.mockResolvedValue(0);
    const result = await calculateUptime(1);
    expect(result).toBe(100);
  });

  test("returns the percentage of UP checks", async () => {
    ServiceLog.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(7); // up
    const result = await calculateUptime(1);
    expect(result).toBe("70.00");
  });
});

describe("calculateUptimeForAll", () => {
  beforeEach(() => jest.clearAllMocks());

  test("aggregates grouped rows into a per-service total/up map", async () => {
    ServiceLog.findAll.mockResolvedValue([
      { serviceId: 1, status: "UP", count: "8" },
      { serviceId: 1, status: "DOWN", count: "2" },
      { serviceId: 2, status: "UP", count: "5" },
    ]);

    const totals = await calculateUptimeForAll(24);

    expect(totals.get(1)).toEqual({ total: 10, up: 8 });
    expect(totals.get(2)).toEqual({ total: 5, up: 5 });
    expect(ServiceLog.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ group: ["serviceId", "status"] })
    );
  });

  test("returns an empty map when there are no logs", async () => {
    ServiceLog.findAll.mockResolvedValue([]);
    const totals = await calculateUptimeForAll(24);
    expect(totals.size).toBe(0);
  });
});
