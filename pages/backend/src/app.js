const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const { authMiddleware } = require('./middleware/auth');

// 路由导入
const authRoutes = require('./routes/auth-simple');
const institutionRoutes = require('./routes/institutions');
const activityRoutes = require('./routes/activities');
const productRoutes = require('./routes/products');
const helperRoutes = require('./routes/helpers');
const elderlyRoutes = require('./routes/elderly');
const grantRoutes = require('./routes/grant');
const exchangeRoutes = require('./routes/exchange');
const recordRoutes = require('./routes/records');
const uploadRoutes = require('./routes/upload');
const userRoutes = require('./routes/users');
const logRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
const logger = require('./middleware/logger');
app.use(logger);

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查路由
const healthRoutes = require('./routes/health');
app.use('/health', healthRoutes);

// 公开路由
app.use('/api/auth', authRoutes);

// 需要认证的路由
app.use('/api/institutions', authMiddleware, institutionRoutes);
app.use('/api/activities', authMiddleware, activityRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/helpers', authMiddleware, helperRoutes);
app.use('/api/elderly', authMiddleware, elderlyRoutes);
app.use('/api/grant', authMiddleware, grantRoutes);
app.use('/api/exchange', authMiddleware, exchangeRoutes);
app.use('/api/records', authMiddleware, recordRoutes);
app.use('/api/upload', authMiddleware, uploadRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/logs', authMiddleware, logRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// 数据库连接并启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 同步模型（生产环境建议使用迁移）
    // await sequelize.sync({ alter: true });
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    setTimeout(startServer, 5000); // 5秒后重试
  }
};

startServer();

module.exports = app;
