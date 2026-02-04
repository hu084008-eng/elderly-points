const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'elderly_care',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root123456',
  {
    host: process.env.DB_HOST || 'mysql',
    port: 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      charset: 'utf8mb4'
    }
  }
);

module.exports = sequelize;
