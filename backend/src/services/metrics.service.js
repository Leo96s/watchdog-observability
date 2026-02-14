const client = require("prom-client");

const latencyHistogram = new client.Histogram({
  name: "endpoint_latency_ms",
  help: "Latência dos endpoints",
  labelNames: ["service"]
});

const serviceStatus = new client.Gauge({
  name: "endpoint_status",
  help: "Estado do serviço (1 = UP, 0 = DOWN)",
  labelNames: ["service"]
});

function updateMetrics(service, statusCode, latency) {
  latencyHistogram.labels(service).observe(latency);
  serviceStatus.labels(service).set(statusCode === 200 ? 1 : 0);
}

module.exports = { updateMetrics, register: client.register };
