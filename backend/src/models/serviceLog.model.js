const { DataTypes } = require("sequelize");
const sequelize = require("../database");

/**
 * Model for logging historical status of services. 
 * This allows us to keep a record of when services were UP or DOWN,
 * their response times, and SSL expiry dates at the time of checks.
 * This data can be used for historical analysis, reporting, and debugging.
 */
const ServiceLog = sequelize.define("ServiceLog", {
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  responseTime: {
    type: DataTypes.INTEGER,
  },
  sslExpiry: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
});

module.exports = ServiceLog;

