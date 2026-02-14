// src/models/serviceStatus.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // o teu sequelize já configurado

const ServiceStatus = sequelize.define("ServiceStatus", {
  serviceName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "UNKNOWN"
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sslExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = ServiceStatus;
