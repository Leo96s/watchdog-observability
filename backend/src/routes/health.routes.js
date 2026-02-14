const router = require("express").Router();

router.get("/", async (req, res) => {
  res.json([
    {
      name: "API Example",
      status: "UP",
      latency: 120
    }
  ]);
});

module.exports = router;
