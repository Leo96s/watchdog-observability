const axios = require("axios");

let previousStates = {};

async function sendAlert(service, status) {
  if (previousStates[service] === status) return;

  previousStates[service] = status;

  if (!process.env.SLACK_WEBHOOK) return;

  await axios.post(process.env.SLACK_WEBHOOK, {
    text: `⚠ Serviço ${service} mudou para ${status}`
  });
}

module.exports = { sendAlert };
