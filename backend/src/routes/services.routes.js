const router = require("express").Router();
const ServiceStatus = require("../models/serviceStatus.model");

// Adicionar um novo serviço
router.post("/", async (req, res) => {
  const { name, url } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: "É necessário fornecer name e url" });
  }

  try {
    const newService = await ServiceStatus.create({
      serviceName: name, // <-- aqui
      url,
      status: "UNKNOWN",
    });

    res.status(201).json({
      message: "Serviço adicionado com sucesso",
      service: newService,
    });
  } catch (err) {
    console.error("Erro ao criar serviço:", err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
