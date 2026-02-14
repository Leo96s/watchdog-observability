const tls = require("tls");
const url = require("url");

async function checkSSL(targetUrl) {
  return new Promise((resolve, reject) => {
    try {
      const { hostname } = new url.URL(targetUrl);

      const socket = tls.connect(443, hostname, { servername: hostname }, () => {
        const cert = socket.getPeerCertificate();
        socket.end();

        if (!cert || !cert.valid_to) {
          return reject(new Error("No certificate found"));
        }

        const expiryDate = new Date(cert.valid_to);
        const now = new Date();
        const diffTime = expiryDate - now;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status = "OK";
        if (daysRemaining < 7) status = "CRITICAL";
        else if (daysRemaining < 30) status = "WARNING";

        resolve({ expiryDate, daysRemaining, status });
      });

      socket.setTimeout(5000);
      socket.on("timeout", () => {
        socket.destroy();
        reject(new Error("SSL timeout"));
      });

      socket.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { checkSSL };
