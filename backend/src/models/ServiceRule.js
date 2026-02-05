const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceRule = sequelize.define('ServiceRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '规则编码'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '服务类型名称'
  },
  points_per_hour: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '每小时积分'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '规则说明'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '1=启用, 0=停用'
  }
}, {
  tableName: 'service_rules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ServiceRule;
