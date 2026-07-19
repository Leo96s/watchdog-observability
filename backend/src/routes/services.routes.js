const router = require("express").Router();
const ServiceStatus = require("../models/serviceStatus.model");
const NotificationDestination = require("../models/notificationDestination.model");
const AlertState = require("../models/alertState.model");
const { apiKeyAuth } = require("../middleware/apiKeyAuth.middleware");
const { isUrlSafe } = require("../utils/urlSafety");
const logger = require("../utils/logger");

const NOTIFICATION_TYPES = ["webhook", "email"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function validateNotification({ type, value }) {
  if (!NOTIFICATION_TYPES.includes(type)) {
    return `Notification type must be one of: ${NOTIFICATION_TYPES.join(", ")}`;
  }
  if (!value || typeof value !== "string") {
    return "Notification value is required";
  }
  if (type === "email" && !EMAIL_RE.test(value)) {
    return "Notification value must be a valid email address";
  }
  if (type === "webhook") {
    const { safe, reason } = await isUrlSafe(value);
    if (!safe) return `Webhook URL rejected: ${reason}`;
  }
  return null;
}

/**
 * Route to get all monitored services (single service detail).
 */
router.get("/:id", async (req, res) => {
  try {
    const service = await ServiceStatus.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{ model: NotificationDestination, as: "destinations" }],
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found!" });
    }

    res.json(service);
  } catch (err) {
    logger.error({ err }, "Error fetching service");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Route to add a new service to be monitored.
 * This endpoint allows clients to register a new service by providing its name and URL.
 * The newly added service will be monitored for health status, response times, and SSL expiry.
 */
router.post("/", apiKeyAuth, async (req, res) => {
  const { name, url, notifications, method, expectedStatus, headers, body } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: "Name and URL are required!" });
  }

  const urlCheck = await isUrlSafe(url);
  if (!urlCheck.safe) {
    return res.status(400).json({ error: `URL rejected: ${urlCheck.reason}` });
  }

  if (notifications && notifications.length > 0) {
    for (const notif of notifications) {
      const error = await validateNotification(notif);
      if (error) return res.status(400).json({ error });
    }
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

      if (notifications && notifications.length > 0) {
        const dests = notifications.map(n => ({ ...n, serviceId: existingService.id }));
        await NotificationDestination.bulkCreate(dests);
      }

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
      method: method || "GET",
      expectedStatus: expectedStatus || 200,
      headers: headers || null,
      body: body || null,
    });

    if (notifications && notifications.length > 0) {
      const dests = notifications.map(n => ({ ...n, serviceId: newService.id }));
      await NotificationDestination.bulkCreate(dests);
    }

    res.status(201).json({
      message: "Service added successfully",
      service: newService,
    });

  } catch (err) {
    logger.error({ err }, "Error on processing service");
    res.status(500).json({ error: "Internal error on save the service." });
  }
});

/**
 * Route to update an existing service's configuration.
 */
router.patch("/:id", apiKeyAuth, async (req, res) => {
  const { id } = req.params;
  const { name, url, method, expectedStatus, headers, body } = req.body;

  try {
    const service = await ServiceStatus.findOne({ where: { id, isActive: true } });
    if (!service) {
      return res.status(404).json({ error: "Service not found!" });
    }

    const updates = {};

    if (name !== undefined) updates.serviceName = name;

    if (url !== undefined && url !== service.url) {
      const urlCheck = await isUrlSafe(url);
      if (!urlCheck.safe) {
        return res.status(400).json({ error: `URL rejected: ${urlCheck.reason}` });
      }
      updates.url = url;
    }

    if (method !== undefined) updates.method = method;
    if (expectedStatus !== undefined) updates.expectedStatus = expectedStatus;
    if (headers !== undefined) updates.headers = headers;
    if (body !== undefined) updates.body = body;

    await service.update(updates);

    res.status(200).json({ message: "Service updated successfully", service });
  } catch (err) {
    logger.error({ err }, "Error updating service");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Route to delete a service from monitoring.
 * This endpoint removes a service based on its unique ID.
 */
router.delete("/:id", apiKeyAuth, async (req, res) => {
  const { id } = req.params;

  try {
    // Search for the service by its primary key (ID)
    const service = await ServiceStatus.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found!" });
    }

    await service.update({ isActive: false }); //we mark the service as inactive instead of deleting it from the database

    await AlertState.destroy({ where: { serviceId: id } });
    await NotificationDestination.destroy({ where: { serviceId: id } });

    res.status(200).json({ message: "Service deactivated successfully" });
  } catch (err) {
    logger.error({ err }, "Error on deactivating service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/notifications", apiKeyAuth, async (req, res) => {
  const { type, value } = req.body;
  const serviceId = req.params.id;

  const error = await validateNotification({ type, value });
  if (error) return res.status(400).json({ error });

  try {
    const newNotif = await NotificationDestination.create({
      serviceId,
      type,
      value
    });

    res.status(201).json(newNotif);
  } catch (err) {
    logger.error({ err }, "Error saving notification");
    res.status(500).json({ error: "Erro ao salvar notificação" });
  }
});

router.delete("/:id/notifications/:notifId", apiKeyAuth, async (req, res) => {
  const { id, notifId } = req.params;

  try {
    const deleted = await NotificationDestination.destroy({
      where: { id: notifId, serviceId: id }
    });

    if (!deleted) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification removed" });
  } catch (err) {
    logger.error({ err }, "Error removing notification");
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
