const axios = require("axios");
const { Resend } = require("resend");

// Inicializa o Resend com a tua API KEY do Render
const resend = new Resend(process.env.RESEND_API_KEY);

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
        console.log(`[Resend] A enviar e-mail para: ${dest.value}`);

        const { data, error } = await resend.emails.send({
          // Enquanto não tens domínio próprio no Resend, USA ESTE REMETENTE:
          from: 'Watchdog Monitor <onboarding@resend.dev>',
          to: [dest.value],
          subject: `⚠️ Alerta de Status: ${serviceName} está ${status}`,
          html: `
            <div style="font-family: sans-serif; background-color: #1a1a1a; color: white; padding: 20px; border-radius: 10px;">
              <h2 style="color: #3b82f6;">Watchdog Alert</h2>
              <p>O serviço <strong>${serviceName}</strong> mudou para o estado: 
                <span style="background: #333; padding: 4px 8px; border-radius: 4px; color: #ff4d4d; font-weight: bold;">
                  ${status}
                </span>
              </p>
              <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
              <small style="color: #888;">Este é um alerta automático do teu sistema de monitorização.</small>
            </div>
          `,
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log(`[Resend] Sucesso ao enviar e-mail! ID: ${data.id}`);
      } catch (err) {
        console.error(`Falha no E-mail para ${dest.value}:`, err.message);
      }
    }
  }
}

module.exports = { sendAlert };
