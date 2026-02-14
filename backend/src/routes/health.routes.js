const router = require("express").Router();
const { monitoredServices } = require("../sockets/socket.manager");

// GET /health → devolve o estado atual dos serviços
router.get("/", async (req, res) => {
  try {
    const statusList = [];

    for (const service of monitoredServices.values()) {
      statusList.push({
        id: service.id,
        name: service.serviceName,
        url: service.url,
        status: service.status,
        lastChecked: service.updatedAt, // ou outro campo de timestamp se tiveres
        responseTime: service.responseTime || null,
        sslExpiry: service.sslExpiry || null
      });
    }

    res.json(statusList);
  } catch (err) {
    console.error("Erro ao obter estado dos serviços:", err.message);
    res.status(500).json({ error: "Erro ao obter estado dos serviços" });
  }
});

module.exports = router;