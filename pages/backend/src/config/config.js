/**
 * 应用配置
 */

const config = {
  // 环境
  env: process.env.NODE_ENV || 'development',
  
  // 服务器配置
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0'
  },

  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || 'elderly_care',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123456'
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'elderly-care-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // 文件上传配置
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    uploadDir: 'uploads'
  },

  // 分页配置
  pagination: {
    defaultPage: 1,
    defaultPageSize: 20,
    maxPageSize: 100
  },

  // 缓存配置
  cache: {
    defaultTTL: 3600, // 1小时
    maxSize: 1000
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: 30,
    maxSize: '10m'
  }
};

module.exports = config;
