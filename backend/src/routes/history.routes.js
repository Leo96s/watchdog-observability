const router = require("express").Router();
const ServiceStatus = require("../models/serviceStatus.model");

router.get("/:service", async (req, res) => {
  const history = await ServiceStatus.findAll({
    where: { name: req.params.service }, // ajusta para a coluna correta
    order: [["createdAt", "DESC"]],
    limit: 200
  });

  res.json(history);
});

module.exports = router;
