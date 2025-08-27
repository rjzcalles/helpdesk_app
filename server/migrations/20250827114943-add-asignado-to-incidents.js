'use strict';
module.exports = {
  // La función 'up' se ejecuta cuando aplicas la migración
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Incidents', 'asignado', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  // La función 'down' se ejecuta si necesitas revertir la migración
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Incidents', 'asignado');
  }
};