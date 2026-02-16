const ServiceStatus = require("../models/serviceStatus.model");
const { checkService } = require("../services/healthChecker.service");

let interval = null;
let monitoredServices = new Map();

async function startMonitoring() {
  console.log("Monitorização iniciada...");

  interval = setInterval(async () => {
    try {
      const services = await ServiceStatus.findAll();

      console.log(
        "Serviços carregados para monitorização:",
        services.map((s) => s.serviceName),
      );

      for (const service of services) {
        await checkService(service);

        monitoredServices.set(service.id, service);
      }
    } catch (err) {
      console.log("Erro ao buscar serviços:", err.message);
    }
  }, 120000);

  try {
    const services = await ServiceStatus.findAll();
    for (const service of services) {
      await checkService(service);
      monitoredServices.set(service.id, service);
    }
  } catch (err) {
    console.log("Erro ao carregar serviços na inicialização:", err.message);
  }
}

module.exports = { startMonitoring, monitoredServices };
