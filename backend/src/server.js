require("dotenv").config();

const http = require("node:http");
const { Server } = require("socket.io");
const app = require("./app");
const { sequelize } = require("./models/index");
const { startMonitoring } = require("./sockets/socket.manager");
const { isOriginAllowed } = require("./utils/corsOrigins");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (isOriginAllowed(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  },
});

(async () => {
  try {
    // Schema is managed via migrations (npm run db:migrate), not sync().
    await sequelize.authenticate();
    logger.info("PostgreSQL connection established successfully!");

    server.listen(PORT, () => {
      logger.info(`Server running on port: ${PORT}`);
      startMonitoring(io);
    });

  } catch (err) {
    logger.error({ err }, "Error starting the server");
    process.exit(1);
  }
})();
