const axios = require("axios");

async function checkEndpoint(endpoint) {
  const start = Date.now();

  try {
    const response = await axios.get(endpoint.url, { timeout: 5000 });
    const latency = Date.now() - start;

    return {
      name: endpoint.name,
      status: "UP",
      statusCode: response.status,
      latency
    };
  } catch (error) {
    return {
      name: endpoint.name,
      status: "DOWN",
      error: error.message
    };
  }
}

module.exports = { checkEndpoint };
