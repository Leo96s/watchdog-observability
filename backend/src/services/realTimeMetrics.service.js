const client = require("prom-client");

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
