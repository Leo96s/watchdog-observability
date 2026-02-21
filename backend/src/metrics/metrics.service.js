const { Registry, Gauge } = require("prom-client");
const ServiceStatus = require("../models/serviceStatus.model");

/**
 * =====================================
 * Metric for service status (UP/DOWN)
 * =====================================
 */
const register = new Registry();

const serviceUp = new Gauge({
  name: "service_up",
  help: "Status do serviço (1 = UP, 0 = DOWN)",
  labelNames: ["serviceName"],
});

async function updateMetrics() {
  const services = await ServiceStatus.findAll();
  services.forEach(service => {
    serviceUp.set({ serviceName: service.serviceName }, service.status === "UP" ? 1 : 0);
  });
}

register.registerMetric(serviceUp);

module.exports = { register, updateMetrics };
