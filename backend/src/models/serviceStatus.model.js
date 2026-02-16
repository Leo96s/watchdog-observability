// src/models/serviceStatus.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // o teu sequelize já configurado

const ServiceStatus = sequelize.define("ServiceStatus", {
  serviceName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
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
});

module.exports = ServiceStatus;
