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
    area: DataTypes.STRING,
    locationX: DataTypes.FLOAT,
    locationY: DataTypes.FLOAT,
    asignado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Incident',
  });
  return Incident;
};