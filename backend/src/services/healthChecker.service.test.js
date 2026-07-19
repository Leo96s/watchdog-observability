jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("../models/serviceStatus.model", () => ({ update: jest.fn() }));
jest.mock("../models/serviceLog.model", () => ({ create: jest.fn() }));
jest.mock("../models/notificationDestination.model", () => ({ findAll: jest.fn() }));
jest.mock("./sslChecker.service", () => ({ checkSSL: jest.fn() }));
jest.mock("./alert.service", () => ({ sendAlert: jest.fn() }));
jest.mock("./request.service", () => ({ requestService: jest.fn() }));
jest.mock("./alertState.service", () => ({ hasStateChanged: jest.fn() }));
jest.mock("./realTimeMetrics.service", () => ({
  requestDuration: { labels: jest.fn().mockReturnThis(), observe: jest.fn() },
  serviceUp: { labels: jest.fn().mockReturnThis(), set: jest.fn() },
}));

const ServiceStatus = require("../models/serviceStatus.model");
const ServiceLog = require("../models/serviceLog.model");
const NotificationDestination = require("../models/notificationDestination.model");
const { requestService } = require("./request.service");
const { hasStateChanged } = require("./alertState.service");
const { sendAlert } = require("./alert.service");
const { checkService } = require("./healthChecker.service");

const baseService = { id: 1, serviceName: "Test", url: "http://example.com", expectedStatus: 200 };

describe("checkService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hasStateChanged.mockResolvedValue(false);
    NotificationDestination.findAll.mockResolvedValue([]);
  });

  test("marks the service UP when the response matches the expected status", async () => {
    requestService.mockResolvedValue({ status: 200 });

    await checkService(baseService);

    expect(ServiceStatus.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "UP" }),
      { where: { id: 1 } }
    );
    expect(ServiceLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ serviceId: 1, status: "UP" })
    );
  });

  test("marks the service DEGRADED when the status doesn't match expectedStatus", async () => {
    requestService.mockResolvedValue({ status: 500 });

    await checkService(baseService);

    expect(ServiceStatus.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "DEGRADED" }),
      { where: { id: 1 } }
    );
  });

  test("treats a 403 response error as reachable (UP)", async () => {
    const err = new Error("Forbidden");
    err.response = { status: 403 };
    requestService.mockRejectedValue(err);

    await checkService(baseService);

    expect(ServiceStatus.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "UP" }),
      { where: { id: 1 } }
    );
  });

  test("marks the service DOWN on a generic request failure", async () => {
    requestService.mockRejectedValue(new Error("ECONNREFUSED"));

    await checkService(baseService);

    expect(ServiceStatus.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "DOWN" }),
      { where: { id: 1 } }
    );
  });

  test("sends alerts when the state changed", async () => {
    requestService.mockResolvedValue({ status: 200 });
    hasStateChanged.mockResolvedValue(true);
    const destinations = [{ type: "webhook", value: "https://discord.example/hook" }];
    NotificationDestination.findAll.mockResolvedValue(destinations);

    await checkService(baseService);

    expect(sendAlert).toHaveBeenCalledWith("Test", "UP", destinations);
  });

  test("does not send alerts when the state is unchanged", async () => {
    requestService.mockResolvedValue({ status: 200 });
    hasStateChanged.mockResolvedValue(false);

    await checkService(baseService);

    expect(sendAlert).not.toHaveBeenCalled();
  });

  test("emits a service:update event with the current status when io is provided", async () => {
    requestService.mockResolvedValue({ status: 200 });
    const io = { emit: jest.fn() };

    await checkService(baseService, io);

    expect(io.emit).toHaveBeenCalledWith(
      "service:update",
      expect.objectContaining({ id: 1, name: "Test", status: "UP" })
    );
  });
});
