const ServiceLog = require("../models/serviceLog.model");
const { Op } = require("sequelize");

async function calculateUptime(serviceId, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const total = await ServiceLog.count({
    where: {
      serviceId,
      createdAt: { [Op.gte]: since },
    },
  });

  const up = await ServiceLog.count({
    where: {
      serviceId,
      status: "UP",
      createdAt: { [Op.gte]: since },
    },
  });

  if (total === 0) return 100;

  return ((up / total) * 100).toFixed(2);
}

module.exports = { calculateUptime };
