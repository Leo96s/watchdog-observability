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
    return res.status(400).json({ error: "You need to give a name and a url of the service!" });
  }

  try {
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



module.exports = router;
