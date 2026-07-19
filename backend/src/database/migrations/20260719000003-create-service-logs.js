"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ServiceLogs", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      serviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "ServiceStatuses", key: "id" },
      },
      status: { type: Sequelize.STRING, allowNull: false },
      responseTime: { type: Sequelize.INTEGER },
      sslExpiry: { type: Sequelize.DATE },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("ServiceLogs", ["serviceId", "createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ServiceLogs");
  },
};
