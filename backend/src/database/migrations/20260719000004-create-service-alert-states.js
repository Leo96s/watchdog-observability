"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ServiceAlertStates", {
      serviceId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: "ServiceStatuses", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      lastStatus: { type: Sequelize.STRING, allowNull: false },
      lastChange: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("ServiceAlertStates");
  },
};
