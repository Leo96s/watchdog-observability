const ServiceStatus = require("../models/serviceStatus.model");
const { checkService } = require("../services/healthChecker.service");
const { toServiceStatusPayload } = require("../utils/serviceMapper");
const logger = require("../utils/logger");

let interval = null;

/**
 * This module is responsible for periodically checking the health of all monitored services.
 * It uses the checkService function to perform health checks, which then pushes the result to
 * connected clients through Socket.IO. The startMonitoring function initializes the monitoring
 * process and sets up a recurring interval to perform checks every 30 seconds. It also performs
 * an initial check immediately upon startup.
 * @param {*} io Socket.IO server instance.
 */
async function startMonitoring(io) {
  logger.info("Monitoring started...");

  io.on("connection", async (socket) => {
    try {
      const services = await ServiceStatus.findAll({ where: { isActive: true } });
      socket.emit("services:snapshot", services.map(toServiceStatusPayload));
    } catch (err) {
      logger.error({ err }, "Error sending initial snapshot to a connecting client");
    }
  });

  const runChecks = async () => {
    try {
      const services = await ServiceStatus.findAll(
        { where: { isActive: true } }
      );
      logger.info(`[Worker] Checking ${services.length} services...`);

      // Runs all pings at the same time
      await Promise.all(services.map(service => checkService(service, io)));

    } catch (err) {
      logger.error({ err }, "Error fetching services to check");
    }
  };

  // 30-second loop
  interval = setInterval(runChecks, 30000);

  // Immediate initial run
  runChecks();
}

module.exports = { startMonitoring };
