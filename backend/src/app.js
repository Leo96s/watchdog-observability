const express = require("express");
const cors = require("cors");

const app = express();

const healthRoutes = require("./routes/health.routes");
app.use("/api/health", healthRoutes);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Watchdog API ativa" });
});

module.exports = app;
