const { DataTypes } = require("sequelize");
const sequelize = require("../database");

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
