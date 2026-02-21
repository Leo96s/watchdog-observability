const router = require("express").Router();
const ServiceStatus = require("../models/serviceStatus.model");

/**
 * Route to add a new service to be monitored.
 * This endpoint allows clients to register a new service by providing its name and URL.
 * The newly added service will be monitored for health status, response times, and SSL expiry.
 */
router.post("/", async (req, res) => {
  const { name, url } = req.body;

  if (!name || !url) {
    return res
      .status(400)
      .json({ error: "You need to give a name and a url of the service!" });
  }

  try {
    // Procura um serviço inativo com o mesmo nome ou URL
    const existingService = await ServiceStatus.findOne({
      where: { url: url, isActive: false },
    });

    if (existingService) {
      await existingService.update({ isActive: true, serviceName: name }); // Reativa
      return res
        .status(200)
        .json({ message: "Serviço reativado!", service: existingService });
    }

    const newService = await ServiceStatus.create({
      serviceName: name,
      url,
      status: "UNKNOWN",
    });

    res.status(201).json({
      message: "Service added successfully",
      service: newService,
    });
  } catch (err) {
    console.error("Erro ao criar serviço:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Route to delete a service from monitoring.
 * This endpoint removes a service based on its unique ID.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se o serviço existe antes de tentar apagar
    const service = await ServiceStatus.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found!" });
    }

    await service.update({ isActive: false }); // Marca como inativo em vez de deletar
    res.status(200).json({ message: "Service deactivated successfully" });
  } catch (err) {
    console.error("Error on deactivating service:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
