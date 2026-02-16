const axios = require("axios");

async function requestService(service) {

  try {
    return await axios({
      method: service.method || "GET",
      url: service.url,
      data: service.body || undefined,
      headers: service.headers || {},
      timeout: 8000,
      validateStatus: () => true
    });

  } catch (err) {

    // fallback automático GET -> HEAD
    if ((service.method || "GET") === "GET") {
      try {
        return await axios.head(service.url, { timeout: 5000 });
      } catch {
        throw err;
      }
    }

    throw err;
  }
}

module.exports = { requestService };
