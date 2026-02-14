const axios = require("axios");
const { updateMetrics } = require("./metrics.service");
const { sendAlert } = require("./alert.service");

async function checkEndpoint(endpoint) {
  const start = Date.now();


  try {
    const response = await axios.get(endpoint.url, { timeout: 5000 });
    const latency = Date.now() - start;

    updateMetrics(endpoint.name, response.status, latency);
    await sendAlert(endpoint.name, "UP");

    return {
      name: endpoint.name,
      status: "UP",
      statusCode: response.status,
      latency
    };

  } catch (error) {
    
    updateMetrics(endpoint.name, 500, 0);
    await sendAlert(endpoint.name, "UP");

    return {
      name: endpoint.name,
      status: "DOWN",
      error: error.message

    };
  }
}

module.exports = { checkEndpoint };
