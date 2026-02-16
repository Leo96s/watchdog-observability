const express = require("express");
const router = express.Router();
const { calculateUptime } = require("../services/upTime.service");
const ServiceStatus = require("../models/serviceStatus.model");

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
    res.status(500).send(`# Erro ao gerar métricas: ${err.message}`);
  }
});

module.exports = router;
