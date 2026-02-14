const router = require("express").Router();
const { register } = require("../services/metrics.service");

router.get("/", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

module.exports = router;
