const express = require("express");
const cors = require("cors");
const app = express();

const { register } = require("./services/realTimeMetrics.service");

// Cors configured to allow requests from any origin (for development purposes)
app.use(cors({ origin: "*" })); 

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/health", require("./routes/health.routes"));
app.use("/upTime-metrics", require("./routes/upTime.routes"));
app.use("/api/history", require("./routes/history.routes"));
app.use("/api/services", require("./routes/services.routes"));

app.get("/realTime-metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/", (req, res) => {
  res.json({ message: "Watchdog API activate" });
});

module.exports = app;