const axios = require("axios");
const emailjs = require("@emailjs/nodejs").default || require("@emailjs/nodejs");

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
          // Log para debug no terminal do Docker
        console.log(`[Webhook] A tentar enviar para: ${dest.value}`);

        await axios.post(dest.value, {
          // O Discord PRECISA do campo "content"
          content: `🚨 **Watchdog Alert**\nO serviço **${serviceName}** mudou para o estado: \`${status}\``,
          // Mantemos o username para o bot aparecer com nome no Discord
          username: "Watchdog Monitor"
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        console.log(`[Webhook] Sucesso ao enviar para ${serviceName}`);
      } catch (err) {
        console.error(`Falha no Webhook para ${dest.value}:`, err.message);
      }
    }

    if (dest.type === "email") {
      try {
        console.log(`[EmailJS] A enviar para: ${dest.value}`);

        console.log(`[Debug] Service: ${process.env.EMAILJS_SERVICE_ID}, Template: ${process.env.EMAILJS_TEMPLATE_ID}`);
        
        const templateParams = {
          to_email: dest.value,
          subject: `⚠️ Alerta: ${serviceName} está ${status}`,
          message: `O serviço ${serviceName} mudou para o estado: ${status}. Verifique o painel.`
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

        console.log(`[EmailJS] Sucesso!`, result);
      } catch (err) {
        console.error(`Falha no E-mail para ${dest.value}:`, err.message);
        if (err.text) console.error(`[EmailJS] Resposta do servidor: ${err.text}`);
      }
    }
  }
}

module.exports = { sendAlert };
