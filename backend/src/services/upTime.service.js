const ServiceLog = require("../models/serviceLog.model");
const { Op, fn, col } = require("sequelize");

/**
 * This service is responsible for calculating the uptime percentage of a monitored service over a 
 * specified time period. It queries the ServiceLog model to count the total number of checks performed 
 * and the number of successful checks (status "UP") for the given service ID and time range.
 * The uptime percentage is calculated as (successful checks / total checks) * 100. If there are no checks,
 * it returns 100% uptime.
 * @param {*} serviceId 
 * @param {*} hours 
 * @returns 
 */
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

/**
 * Same calculation as calculateUptime, but for every service in a single
 * aggregated query instead of 2 queries per service (avoids N+1).
 * @param {*} hours
 * @returns {Promise<Map<number, { total: number, up: number }>>}
 */
async function calculateUptimeForAll(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const rows = await ServiceLog.findAll({
    attributes: ["serviceId", "status", [fn("COUNT", col("id")), "count"]],
    where: { createdAt: { [Op.gte]: since } },
    group: ["serviceId", "status"],
    raw: true,
  });

  const totals = new Map();
  for (const row of rows) {
    const entry = totals.get(row.serviceId) || { total: 0, up: 0 };
    const count = Number(row.count);
    entry.total += count;
    if (row.status === "UP") entry.up += count;
    totals.set(row.serviceId, entry);
  }

  return totals;
}

module.exports = { calculateUptime, calculateUptimeForAll };
