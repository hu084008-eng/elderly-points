const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exchange = sequelize.define('Exchange', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  institution_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  target_type: {
    type: DataTypes.ENUM('helper', 'elderly'),
    allowNull: false
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  target_name: {
    type: DataTypes.STRING(50)
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING(100)
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING(20)
  },
  total_points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('completed'),
    defaultValue: 'completed'
  },
  exchange_date: {
    type: DataTypes.DATE
  },
  handler_id: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'exchanges',
  timestamps: false,
  createdAt: false,
  updatedAt: false
});

module.exports = Exchange;
