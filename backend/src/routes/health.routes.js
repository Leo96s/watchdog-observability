const router = require("express").Router();
const ServiceStatus = require("../models/serviceStatus.model");
const { toServiceStatusPayload } = require("../utils/serviceMapper");

/**
 * Route to get the current health status of all monitored services.
 * This endpoint returns a list of services with their current status (UP/DOWN),
 * the last time they were checked, their response times, and SSL expiry dates.
 * This allows clients to quickly see the health of all services at a glance.
 */
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const offset = Number(req.query.offset) || 0;

    // Apenas lê da BD. Resposta em milissegundos!
    const services = await ServiceStatus.findAll({
      where: { isActive: true },
      order: [['createdAt', 'ASC']],
      limit,
      offset,
    });

    res.json(services.map(toServiceStatusPayload));
  } catch (err) {
    res.status(500).json({ error: "Erro ao ler status dos serviços" });
  }
});

module.exports = router;