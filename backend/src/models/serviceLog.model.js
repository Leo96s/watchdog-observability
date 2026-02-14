const { DataTypes } = require("sequelize");
const sequelize = require("../database");

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

