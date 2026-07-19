"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("NotificationDestinations", {
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
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      type: { type: Sequelize.ENUM("webhook", "email"), allowNull: false },
      value: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("NotificationDestinations");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_NotificationDestinations_type";'
    );
  },
};
