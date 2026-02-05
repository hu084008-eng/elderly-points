const { Sequelize } = require('sequelize');

// 支持 MySQL 和 PostgreSQL
const dialect = process.env.DB_DIALECT || 'mysql';
const defaultPort = dialect === 'postgres' ? 5432 : 3306;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'elderly_care',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root123456',
  {
    host: process.env.DB_HOST || 'mysql',
    port: parseInt(process.env.DB_PORT) || defaultPort,
    dialect: dialect,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: dialect === 'postgres' ? {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    } : {
      charset: 'utf8mb4'
    }
  }
);

module.exports = sequelize;
