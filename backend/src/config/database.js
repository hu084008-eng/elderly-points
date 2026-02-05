const { Sequelize } = require('sequelize');

// 调试：打印环境变量
console.log('DEBUG: DATABASE_URL exists?', !!process.env.DATABASE_URL);
console.log('DEBUG: DATABASE_URL value:', process.env.DATABASE_URL ? '***hidden***' : 'not set');

let sequelize;

// 优先使用 DATABASE_URL (Render 等云平台提供)
if (process.env.DATABASE_URL) {
  console.log('DEBUG: Using DATABASE_URL for PostgreSQL connection');
  
  const isInternalHost = process.env.DATABASE_URL.includes('.internal') || 
                         !process.env.DATABASE_URL.includes('.render.com');
  
  console.log('DEBUG: Is internal host?', isInternalHost);
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: isInternalHost ? {
      // 内部网络不需要 SSL
      ssl: false
    } : {
      // 外部连接需要 SSL
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  console.log('DEBUG: Using individual DB config (MySQL fallback)');
  
  // 本地开发使用分开的配置
  const dialect = process.env.DB_DIALECT || 'mysql';
  const defaultPort = dialect === 'postgres' ? 5432 : 3306;

  sequelize = new Sequelize(
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
}

module.exports = sequelize;
