const axios = require("axios");
const nodemailer = require("nodemailer");

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
      // Exemplo rápido com Nodemailer (requer configuração de SMTP no .env)
      try {
        let transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });

        await transporter.sendMail({
          from: '"Watchdog" <alert@watchdog.com>',
          to: dest.value,
          subject: `Alerta: ${serviceName} está ${status}`,
          text: `O serviço ${serviceName} mudou o seu estado para ${status}.`,
        });
      } catch (err) {
        console.error(`Falha no E-mail para ${dest.value}:`, err.message);
      }
    }
  }
}

module.exports = { sendAlert };
