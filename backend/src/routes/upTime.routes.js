const express = require("express");
const router = express.Router();
const { calculateUptimeForAll } = require("../services/upTime.service");
const ServiceStatus = require("../models/serviceStatus.model");
const { register, serviceUp, serviceUptime } = require("../services/realTimeMetrics.service");
const logger = require("../utils/logger");

/**
 * Route to get uptime metrics for all monitored services.
 * This endpoint calculates the uptime percentage for each service over the last 24 hours
 * and returns it in Prometheus exposition format via prom-client, which escapes label
 * values safely (service names are user-provided input).
 * It also includes the current status of each service (UP/DOWN) as a separate metric.
 */
router.get("/metrics", async (req, res) => {
  try {
    const services = await ServiceStatus.findAll({ where: { isActive: true } });
    const totals = await calculateUptimeForAll(24);

    for (const service of services) {
      const entry = totals.get(service.id);
      const uptime = !entry || entry.total === 0
        ? 100
        : Number(((entry.up / entry.total) * 100).toFixed(2));

      serviceUptime.labels(service.serviceName).set(uptime);
      serviceUp.labels(service.serviceName).set(service.status === "UP" ? 1 : 0);
    }

    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    logger.error({ err }, "Error generating uptime metrics");
    res.status(500).send(`# Error on generate metrics: ${err.message}`);
  }
});

module.exports = router;
