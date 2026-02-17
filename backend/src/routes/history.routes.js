const router = require("express").Router();
const ServiceLog = require("../models/serviceLog.model");
const ServiceStatus = require("../models/serviceStatus.model");

router.get("/:name", async (req, res) => {
  try {
    // 1. Procurar usando 'serviceName' que é o que está no teu model
    const service = await ServiceStatus.findOne({ 
      where: { serviceName: req.params.name } 
    });

    if (!service) {
      return res.status(404).json({ message: "Serviço não encontrado no sistema" });
    }

    // 2. Usar o ID do serviço para buscar os logs
    const history = await ServiceLog.findAll({
      where: { serviceId: service.id }, 
      order: [["createdAt", "DESC"]],
      limit: 200
    });

    res.json(history);
  } catch (error) {
    console.error("ERRO NO BACKEND:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
