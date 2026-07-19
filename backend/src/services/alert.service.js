const axios = require("axios");
const emailjs = require("@emailjs/nodejs").default || require("@emailjs/nodejs");
const logger = require("../utils/logger");

/**
 * This service is responsible for sending alerts when a service changes its status (e.g., from UP to DOWN).
 * It uses a webhook URL defined in the environment variables to send notifications.
 * The alert includes the name of the service and its new status.
 * @param {*} service
 * @param {*} status
 * @returns
 */
async function sendAlert(serviceName, status, destinations) {
  if (!destinations || destinations.length === 0) return;

  for (const dest of destinations) {
    if (dest.type === "webhook") {
      try {
        logger.info(`[Webhook] Sending to: ${dest.value}`);

        await axios.post(dest.value, {
          // Discord requires the "content" field
          content: `🚨 **Watchdog Alert**\nService **${serviceName}** changed to state: \`${status}\``,
          // Keep the username so the bot shows up with a name on Discord
          username: "Watchdog Monitor"
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        logger.info(`[Webhook] Sent successfully for ${serviceName}`);
      } catch (err) {
        logger.error({ err }, `Webhook failed for ${dest.value}`);
      }
    }

    if (dest.type === "email") {
      try {
        logger.info(`[EmailJS] Sending to: ${dest.value}`);

        const templateParams = {
          to_email: dest.value,
          subject: `⚠️ Alert: ${serviceName} is ${status}`,
          message: `Service ${serviceName} changed to state: ${status}. Check the dashboard.`
        };

        const result = await emailjs.send(
          process.env.EMAILJS_SERVICE_ID,
          process.env.EMAILJS_TEMPLATE_ID,
          templateParams,
          {
            publicKey: process.env.EMAILJS_PUBLIC_KEY,
            privateKey: process.env.EMAILJS_PRIVATE_KEY,
          }
        );

        logger.info({ result }, "[EmailJS] Sent successfully");
      } catch (err) {
        logger.error({ err, response: err.text }, `Email failed for ${dest.value}`);
      }
    }
  }
}

module.exports = { sendAlert };
