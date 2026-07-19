"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ServiceStatuses", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      serviceName: { type: Sequelize.STRING, allowNull: false },
      url: { type: Sequelize.STRING, allowNull: false, unique: true },
      status: { type: Sequelize.STRING, defaultValue: "UNKNOWN" },
      responseTime: { type: Sequelize.INTEGER, allowNull: true },
      sslExpiry: { type: Sequelize.DATE, allowNull: true },
      method: { type: Sequelize.STRING, defaultValue: "GET" },
      expectedStatus: { type: Sequelize.INTEGER, defaultValue: 200 },
      headers: { type: Sequelize.JSONB, allowNull: true },
      body: { type: Sequelize.JSONB, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ServiceStatuses");
  },
};
