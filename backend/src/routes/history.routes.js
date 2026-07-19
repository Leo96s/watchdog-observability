const router = require("express").Router();
const ServiceLog = require("../models/serviceLog.model");
const ServiceStatus = require("../models/serviceStatus.model");
const logger = require("../utils/logger");

/**
 * Route to get the historical status of a specific service by its name.
 * This endpoint returns a list of historical records for the specified service,
 * including timestamps, status (UP/DOWN), response times, and SSL expiry dates.
 * This allows clients to analyze the historical performance and reliability of the service.
 */
router.get("/:name", async (req, res) => {
  try {
    const service = await ServiceStatus.findOne({ 
      where: { serviceName: req.params.name } 
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found in the system" });
    }

    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const offset = Number(req.query.offset) || 0;

    //Use ID for querying logs to ensure we get the correct history even
    // if there are multiple services with the same name
    const history = await ServiceLog.findAll({
      where: { serviceId: service.id },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json(history);
  } catch (error) {
    logger.error({ error }, "Error fetching service history");
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
