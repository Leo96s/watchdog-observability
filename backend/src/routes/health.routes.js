const router = require("express").Router();
const ServiceStatus = require("../models/serviceStatus.model");

/**
 * Route to get the current health status of all monitored services.
 * This endpoint returns a list of services with their current status (UP/DOWN),
 * the last time they were checked, their response times, and SSL expiry dates.
 * This allows clients to quickly see the health of all services at a glance.
 */
router.get("/", async (req, res) => {
  try {
    // Apenas lê da BD. Resposta em milissegundos!
    const services = await ServiceStatus.findAll({
      where: { isActive: true },
      order: [['createdAt', 'ASC']]
    });

    // Mapear para garantir que os nomes dos campos batem com o que o Frontend espera
    const statusList = services.map(service => ({
      id: service.id,
      name: service.serviceName,
      url: service.url,
      status: service.status,
      lastChecked: service.updatedAt, 
      responseTime: service.responseTime || null,
      sslExpiry: service.sslExpiry || null
    }));

    res.json(statusList);
  } catch (err) {
    res.status(500).json({ error: "Erro ao ler status dos serviços" });
  }
});

module.exports = router;