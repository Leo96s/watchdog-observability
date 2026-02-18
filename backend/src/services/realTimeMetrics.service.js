const client = require("prom-client");

/**
 * This service is responsible for defining and updating real-time metrics for Prometheus.
 * It includes metrics for service availability (UP/DOWN) and response times.
 * The metrics are updated after each health check performed by the healthChecker service.
 * These metrics can be scraped by Prometheus to provide real-time monitoring of the services.
 */
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const requestDuration = new client.Histogram({
  name: "watchdog_request_duration_ms",
  help: "Tempo de resposta dos serviços",
  labelNames: ["service", "status"],
  buckets: [50, 100, 200, 500, 1000, 2000, 5000]
});

const serviceUp = new client.Gauge({
  name: "watchdog_service_up",
  help: "Estado do serviço (1=up,0=down)",
  labelNames: ["service"]
});

register.registerMetric(requestDuration);
register.registerMetric(serviceUp);

module.exports = {
  register,
  requestDuration,
  serviceUp
};
