'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Incident extends Model {
    static associate(models) {
      // define association here
      Incident.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Incident.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: DataTypes.STRING,
    
    // --- ASEGÚRATE DE QUE ESTAS LÍNEAS EXISTAN ---
    area: DataTypes.STRING,
    locationX: DataTypes.FLOAT,
    locationY: DataTypes.FLOAT
    
  }, {
    sequelize,
    modelName: 'Incident',
  });
  return Incident;
};