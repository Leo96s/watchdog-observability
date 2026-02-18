const router = require("express").Router();
const { monitoredServices } = require("../sockets/socket.manager");

/**
 * Route to get the current health status of all monitored services.
 * This endpoint returns a list of services with their current status (UP/DOWN),
 * the last time they were checked, their response times, and SSL expiry dates.
 * This allows clients to quickly see the health of all services at a glance.
 */
router.get("/", async (req, res) => {
  try {
    const statusList = [];

    for (const service of monitoredServices.values()) {
      statusList.push({
        id: service.id,
        name: service.serviceName,
        url: service.url,
        status: service.status,
        lastChecked: service.updatedAt, 
        responseTime: service.responseTime || null,
        sslExpiry: service.sslExpiry || null
      });
    }

    res.json(statusList);
  } catch (err) {
    console.error("Error on getting the state of service:", err.message);
    res.status(500).json({ error: "Error getting services status" });
  }
});

module.exports = router;