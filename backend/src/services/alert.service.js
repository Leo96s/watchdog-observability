const axios = require("axios");
const nodemailer = require("nodemailer");

console.log(`[SMTP Config] Host: ${process.env.SMTP_HOST} | Port: ${process.env.SMTP_PORT} | User: ${process.env.SMTP_USER}`);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // true para porta 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com'
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});

transporter.verify((error, success) => {
  if (error) {
    console.error("[SMTP Check] Erro de configuração:", error.message);
  } else {
    console.log("[SMTP Check] Servidor pronto para enviar emails!");
  }
});

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
        await transporter.sendMail({
          from: `"Watchdog Monitor" <${process.env.SMTP_USER}>`,
          to: dest.value,
          subject: `⚠️ Alerta de Status: ${serviceName} está ${status}`,
          html: `
            <div style="font-family: sans-serif; color: white; pading: 20px; border-radius: 10px;">
              <h2 style="color: #3b82f6;">Watchdog Alert</h2>
              <p>O serviço <strong>${serviceName}</strong> mudou para o estado: <span style="background: #333; padding: 2px 5px; border-radius: 4px;">${status}</span></p>
              <hr style="border: 0; border-top: 1px solid #333;" />
              <small>Este é um alerta automático do teu sistema de monitorização.</small>
            </div>
          `,
        });
      } catch (err) {
        console.error(`Falha no E-mail para ${dest.value}:`, err.message);
      }
    }
  }
}

module.exports = { sendAlert };
