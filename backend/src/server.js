require("dotenv").config();
const http = require("node:http");
const app = require("./app");
const sequelize = require("./database");
const { startMonitoring } = require("./sockets/socket.manager");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Base de dados sincronizada");

    await sequelize.authenticate();
    console.log("Conexão ao PostgreSQL estabelecida com sucesso!");

    server.listen(PORT, () => {
      console.log(`Servidor a correr na porta ${PORT}`);
      startMonitoring();
    });

  } catch (err) {
    console.error("Erro na base de dados:", err);
  }
})();
