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
    image_url: DataTypes.STRING,
    asignado: DataTypes.STRING,
    problemType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Informática'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Incident',
  });
  return Incident;
};