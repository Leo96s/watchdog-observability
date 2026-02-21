const axios = require("axios");

/**
 * This service is responsible for making HTTP requests to the monitored services during health checks.
 * It attempts to make the request using the specified method, URL, headers, and body.
 * If the request fails and it's a GET request, it will attempt a HEAD request as a fallback.
 * This allows us to determine if the service is up even if it doesn't respond properly to GET requests.
 * @param {*} service 
 * @returns 
 */
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
