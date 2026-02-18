const { DataTypes } = require("sequelize");
const sequelize = require("../database");

/**
 * Model for tracking the last known state of each service for alerting purposes.
 * This allows us to determine when a service changes state (e.g., from UP to DOWN)
 * and trigger alerts accordingly.
 */
const AlertState = sequelize.define("ServiceAlertState", {
  serviceId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  lastStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastChange: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = AlertState;
