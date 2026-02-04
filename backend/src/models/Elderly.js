const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Elderly = sequelize.define('Elderly', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  total_points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'elderly',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Elderly;
