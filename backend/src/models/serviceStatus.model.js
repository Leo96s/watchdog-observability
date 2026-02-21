// src/models/serviceStatus.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // o teu sequelize já configurado

/**
 * Model for the current status of monitored services.
 * This model holds the latest status of each service, which is updated every time a check is performed.
 * It includes the service name, URL, current status (UP/DOWN), response time,
 * SSL expiry date, and other relevant information.
 */
const ServiceStatus = sequelize.define("ServiceStatus", {
  serviceName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "UNKNOWN",
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sslExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  method: {
    type: DataTypes.STRING,
    defaultValue: "GET",
  },

  expectedStatus: {
    type: DataTypes.INTEGER,
    defaultValue: 200,
  },

  headers: {
    type: DataTypes.JSONB,
    allowNull: true,
  },

  body: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = ServiceStatus;
