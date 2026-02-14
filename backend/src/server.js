require("dotenv").config();
const http = require("node:http");
const app = require("./app");

const { initSocket } = require("./sockets/socket.manager");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT}`);
});
