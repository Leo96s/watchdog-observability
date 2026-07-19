const ServiceStatus = require("../models/serviceStatus.model");
const ServiceLog = require("../models/serviceLog.model");
const { checkSSL } = require("./sslChecker.service");
const { sendAlert } = require("./alert.service");
const { requestDuration, serviceUp } = require("./realTimeMetrics.service");
const { requestService } = require("./request.service");
const { hasStateChanged } = require("./alertState.service");
const { toServiceStatusPayload } = require("../utils/serviceMapper");
const logger = require("../utils/logger");

/**
 * This service is responsible for performing health checks on the monitored services.
 * It checks the service's availability, response time, and SSL certificate status (if applicable).
 * After performing the check, it updates the service's status in the database, logs the result,
 * updates real-time metrics for Prometheus, emits a Socket.IO update, and triggers alerts if there
 * is a status change.
 * @param {*} service
 * @param {*} io Socket.IO server instance, used to push real-time updates to connected clients.
 */
async function checkService(service, io) {
  const start = Date.now();
  let status = "UP";
  let responseTime = null;
  let sslExpiry = null;

  try {
    const res = await requestService(service);
    responseTime = Date.now() - start;

    const healthy = service.expectedStatus
      ? res.status === service.expectedStatus
      : res.status < 500;

    if (!healthy) status = "DEGRADED";

    // SSL
    if (service.url.startsWith("https")) {
      try {
        const sslData = await checkSSL(service.url);
        sslExpiry = sslData.expiryDate;
      } catch {
        status = "DEGRADED";
      }
    }

    // METRICS
    const metricStatus = healthy ? "success" : "error";
    requestDuration
      .labels(service.serviceName, metricStatus)
      .observe(responseTime);
    serviceUp.labels(service.serviceName).set(healthy ? 1 : 0);
  } catch (err) {
    if (err.response && err.response.status === 403) {
      status = "UP";
      logger.warn(`Rate limit hit but service is reachable: ${service.url}`);
    } else {
      status = "DOWN";
    }
    responseTime = Date.now() - start;

    requestDuration.labels(service.serviceName, "error").observe(responseTime);
    serviceUp.labels(service.serviceName).set(0);
  }

  // DB
  await ServiceStatus.update(
    { status, responseTime, sslExpiry },
    { where: { id: service.id } },
  );

  await ServiceLog.create({
    serviceId: service.id,
    status,
    responseTime,
    sslExpiry,
  });

  logger.info(`[Worker] Service: ${service.serviceName} | Current status: ${status}`);

  if (io) {
    io.emit("service:update", toServiceStatusPayload({
      id: service.id,
      serviceName: service.serviceName,
      url: service.url,
      status,
      updatedAt: new Date(),
      responseTime,
      sslExpiry,
    }));
  }

  const stateChanged = await hasStateChanged(service.id, status);

  if (stateChanged) {
    logger.info(`[Alert] Preparing to notify for service ${service.serviceName}...`);

    const NotificationDestination = require("../models/notificationDestination.model");
    const destinations = await NotificationDestination.findAll({
      where: { serviceId: service.id }
    });

    logger.info(`[Alert] Found ${destinations.length} destinations in the database.`);

    await sendAlert(service.serviceName, status, destinations);
  }

}

module.exports = { checkService };
