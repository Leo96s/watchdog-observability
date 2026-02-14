const router = require("express").Router();
const endpoints = require("../config/endpoints");
const { checkEndpoint } = require("../services/healthChecker.service");

router.get("/", async (req, res) => {
  const results = await Promise.all(
    endpoints.map(endpoint => checkEndpoint(endpoint))
  );

  res.json(results);
});

module.exports = router;
