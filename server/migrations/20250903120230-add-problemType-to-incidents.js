'use strict';
module.exports = {

up: async (queryInterface, Sequelize) => {
  return queryInterface.addColumn('incidents', 'problemType', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'Informática', // O el valor que prefieras por defecto
  });
},
down: async (queryInterface, Sequelize) => {
  return queryInterface.removeColumn('incidents', 'problemType');
}
}