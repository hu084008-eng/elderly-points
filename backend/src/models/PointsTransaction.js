const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointsTransaction = sequelize.define('PointsTransaction', {
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
  type: {
    type: DataTypes.ENUM('earn', 'spend'),
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  service_category: {
    type: DataTypes.STRING(50)
  },
  service_duration: {
    type: DataTypes.STRING(20)
  },
  calculation_type: {
    type: DataTypes.ENUM('fixed', 'dynamic')
  },
  activity_id: {
    type: DataTypes.INTEGER
  },
  activity_name: {
    type: DataTypes.STRING(100)
  },
  points_per_hour: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  image_url: {
    type: DataTypes.STRING(500)
  },
  operator_id: {
    type: DataTypes.INTEGER
  },
  operator_name: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'points_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = PointsTransaction;
