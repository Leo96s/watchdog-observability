const ServiceStatus = require("../models/serviceStatus.model");
const ServiceLog = require("../models/serviceLog.model");
const { checkSSL } = require("./sslChecker.service");
const { sendAlert } = require("./alert.service");
const { requestDuration, serviceUp } = require("./realTimeMetrics.service");
const { requestService } = require("./request.service");
const { hasStateChanged } = require("./alertState.service");
async function checkService(service) {
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
      status = "UP"; // Ou um novo status "LIMITED"
      console.warn("Rate limit atingido, mas o serviço parece estar vivo.");
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

  // ALERTA PERSISTENTE
  if (await hasStateChanged(service.id, status)) {
    await sendAlert(service.serviceName, status);
  }
}

module.exports = { checkService };
