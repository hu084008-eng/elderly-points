const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Institution = sequelize.define('Institution', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  address: {
    type: DataTypes.STRING(200)
  },
  director_id: {
    type: DataTypes.INTEGER
  },
  contact_person: {
    type: DataTypes.STRING(50)
  },
  contact_phone: {
    type: DataTypes.STRING(20)
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'institutions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Institution;
