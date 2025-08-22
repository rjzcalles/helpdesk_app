'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Añade la columna para la coordenada X
    await queryInterface.addColumn('Incidents', 'locationX', {
      type: Sequelize.FLOAT 
    });
    // Añade la columna para la coordenada Y
    await queryInterface.addColumn('Incidents', 'locationY', {
      type: Sequelize.FLOAT
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Esto es para poder revertir los cambios si fuera necesario
    await queryInterface.removeColumn('Incidents', 'locationX');
    await queryInterface.removeColumn('Incidents', 'locationY');
  }
};