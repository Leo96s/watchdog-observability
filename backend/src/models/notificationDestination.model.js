// src/models/notificationDestination.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const NotificationDestination = sequelize.define("NotificationDestination", {
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("webhook", "email"),
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING, // O URL do webhook ou o Endereço de E-mail
    allowNull: false,
  },
});

module.exports = NotificationDestination;