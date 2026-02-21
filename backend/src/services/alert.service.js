const axios = require("axios");

/**
 * This service is responsible for sending alerts when a service changes its status (e.g., from UP to DOWN).
 * It uses a webhook URL defined in the environment variables to send notifications.
 * The alert includes the name of the service and its new status.
 * @param {*} service 
 * @param {*} status 
 * @returns 
 */
async function sendAlert(service, status) {
  if (!process.env.WEBHOOK_URL) return;

  try {
    await axios.post(process.env.WEBHOOK_URL, {
      text: `🚨 Serviço ${service} mudou para ${status}`,
      content: `🚨 Serviço ${service} mudou para ${status}`
    });
  } catch (err) {
    console.log("Falha ao enviar alerta:", err.response?.status || err.message);
  }
}

module.exports = { sendAlert };
