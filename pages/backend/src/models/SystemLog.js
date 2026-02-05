const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemLog = sequelize.define('SystemLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  username: {
    type: DataTypes.STRING(50)
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型'
  },
  module: {
    type: DataTypes.STRING(50),
    comment: '操作模块'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '操作描述'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    comment: 'IP地址'
  },
  user_agent: {
    type: DataTypes.STRING(500),
    comment: '用户代理'
  },
  request_data: {
    type: DataTypes.JSON,
    comment: '请求数据'
  },
  response_status: {
    type: DataTypes.INTEGER,
    comment: '响应状态码'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'system_logs',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SystemLog;
