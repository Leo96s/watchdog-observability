const axios = require("axios");

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
