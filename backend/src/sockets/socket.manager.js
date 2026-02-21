const ServiceStatus = require("../models/serviceStatus.model");
const { checkService } = require("../services/healthChecker.service");

let interval = null;
let monitoredServices = new Map();

/**
 * This socket manager is responsible for periodically checking the health of all monitored services.
 * It uses the checkService function to perform health checks and updates the monitoredServices map with 
 * the latest status. The startMonitoring function initializes the monitoring process and sets up a 
 * recurring interval to perform checks every 2 minutes. It also performs an initial check immediately 
 * upon startup to populate the monitoredServices map with current data.
 */
async function startMonitoring() {
  console.log("Monitorização iniciada...");

  const runChecks = async () => {
    try {
      const services = await ServiceStatus.findAll(
        { where: { isActive: true } }
      );
      console.log(`[Worker] Verificando ${services.length} serviços...`);

      // Executa todos os pings AO MESMO TEMPO
      await Promise.all(services.map(service => checkService(service)));
      
    } catch (err) {
      console.log("Error on getting services:", err.message);
    }
  };

  // Loop de 30 em 30 segundos
  interval = setInterval(runChecks, 30000);

  // Execução inicial imediata
  runChecks();
}

module.exports = { startMonitoring };
