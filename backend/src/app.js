const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", require("./routes/health.routes"));
app.use("/metrics", require("./routes/metrics.routes"));
app.use("/api/history", require("./routes/history.routes"));
app.use("/services", require("./routes/services.routes"));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Watchdog API ativa" });
});


module.exports = app;
