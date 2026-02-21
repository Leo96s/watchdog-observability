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
    return res.status(400).json({ error: "Name and URL are required!" });
  }

  try {
    // Search for an existing service with the same URL to prevent duplicates
    const existingService = await ServiceStatus.findOne({ where: { url } });

    if (existingService) {
      // If the service exists and is active, we return a conflict error
      if (existingService.isActive) {
        return res.status(409).json({ 
          error: "This service URL is already being monitored!" 
        });
      }

      // If the service exists but is inactive, we reactivate it and update the name
      await existingService.update({ 
        serviceName: name, 
        isActive: true,
        status: "UNKNOWN" 
      });
      
      return res.status(200).json({ 
        message: "Serviço encontrado no histórico e reativado!", 
        service: existingService 
      });
    }

    //If the service does not exist, we create a new entry in the database
    const newService = await ServiceStatus.create({
      serviceName: name,
      url,
      status: "UNKNOWN",
      isActive: true, 
    });

    res.status(201).json({
      message: "Service added successfully",
      service: newService,
    });

  } catch (err) {
    console.error("Error on processing service:", err);
    res.status(500).json({ error: "Internal error on save the service." });
  }
});

/**
 * Route to delete a service from monitoring.
 * This endpoint removes a service based on its unique ID.
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Search for the service by its primary key (ID)
    const service = await ServiceStatus.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found!" });
    }

    await service.update({ isActive: false }); //we mark the service as inactive instead of deleting it from the database
    res.status(200).json({ message: "Service deactivated successfully" });
  } catch (err) {
    console.error("Error on deactivating service:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
