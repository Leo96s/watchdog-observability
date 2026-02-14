const { Server } = require("socket.io");
const endpoints = require("../config/endpoints");
const { checkEndpoint } = require("../services/healthChecker.service");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  setInterval(async () => {
    const results = await Promise.all(
      endpoints.map(endpoint => checkEndpoint(endpoint))
    );

    io.emit("status-update", results);
  }, 10000);
}

module.exports = { initSocket };
