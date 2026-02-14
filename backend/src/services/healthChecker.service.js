const axios = require("axios");
const ServiceStatus = require("../models/serviceStatus.model");
const ServiceLog = require("../models/serviceLog.model");
const { checkSSL } = require("./sslChecker.service");
const { sendAlert } = require("./alert.service");

let lastKnownState = {};

async function checkService(service) {
  const start = Date.now();
  let status = "UP";
  let responseTime = null;
  let sslExpiry = null;

  console.log("A verificar serviço:", service.serviceName, service.url);

  try {
    const response = await axios.get(service.url, {
      timeout: 8000,
      validateStatus: () => true,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 WatchdogMonitor/1.0",
        "Accept": "*/*",
        "Connection": "keep-alive"
      }
    });

    responseTime = Date.now() - start;

    // 5xx = servidor respondeu erro → degradado
    if (response.status >= 500) {
      status = "DEGRADED";
    }

    // SSL check (apenas se HTTPS)
    if (service.url.startsWith("https")) {
      try {
        const sslData = await checkSSL(service.url);
        sslExpiry = sslData.expiryDate;
      } catch (err) {
        console.log("Erro SSL:", err.message);
        status = "DEGRADED";
      }
    }

  } catch (err) {
    // Falha real de conexão → DOWN
    status = "DOWN";
  }

  // Atualizar estado atual
  await ServiceStatus.update(
    { status, responseTime, sslExpiry },
    { where: { id: service.id } }
  );

  // Guardar histórico
  await ServiceLog.create({
    serviceId: service.id,
    status,
    responseTime,
    sslExpiry
  });

  // Alertas apenas quando muda
  if (lastKnownState[service.id] !== status) {
    await sendAlert(service.serviceName, status);
    lastKnownState[service.id] = status;
  }
}

module.exports = { checkService };
