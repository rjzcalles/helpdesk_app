'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Incidents', 'asignado', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Incidents', 'asignado', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  }
};
