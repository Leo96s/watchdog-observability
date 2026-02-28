require("dotenv").config();

const http = require("node:http");
const app = require("./app");
const { sequelize } = require("./models/index");
const { startMonitoring } = require("./sockets/socket.manager");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully!");

    await sequelize.authenticate();
    console.log("PostgreSQL connection established successfully!");

    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
      startMonitoring();
    });

  } catch (err) {
    console.error("Error from database:", err);
  }
})();
