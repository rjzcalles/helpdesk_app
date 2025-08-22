'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Incidents', 'area', {
      type: Sequelize.STRING,
      allowNull: true, // Lo hacemos opcional por ahora
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Incidents', 'area');
  }
};