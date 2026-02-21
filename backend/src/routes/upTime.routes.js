const express = require("express");
const router = express.Router();
const { calculateUptime } = require("../services/upTime.service");
const ServiceStatus = require("../models/serviceStatus.model");

/**
 * Route to get uptime metrics for all monitored services.
 * This endpoint calculates the uptime percentage for each service over the last 24 hours
 * and returns it in a format suitable for Prometheus scraping.
 * It also includes the current status of each service (UP/DOWN) as a separate metric.
 */
router.get("/metrics", async (req, res) => {
  try {
    const services = await ServiceStatus.findAll();
    let metrics = "";

    for (const s of services) {
      const uptime = await calculateUptime(s.id, 24);
      metrics += `service_uptime{service="${s.serviceName}"} ${uptime}\n`;
      metrics += `service_status{service="${s.serviceName}"} ${s.status === "UP" ? 1 : 0}\n`;
    }

    res.set("Content-Type", "text/plain");
    res.send(metrics);
  } catch (err) {
    res.status(500).send(`# Error on generate metrics: ${err.message}`);
  }
});

module.exports = router;
