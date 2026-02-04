const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const cacheService = require('../services/cacheService');

// 健康检查
router.get('/', async (req, res) => {
  const checks = {
    database: false,
    cache: false,
    timestamp: new Date().toISOString()
  };

  // 检查数据库
  try {
    await sequelize.authenticate();
    checks.database = true;
  } catch (error) {
    console.error('数据库健康检查失败:', error);
  }

  // 检查缓存
  try {
    cacheService.set('health_check', 'ok', 10);
    const cacheResult = cacheService.get('health_check');
    checks.cache = cacheResult === 'ok';
  } catch (error) {
    console.error('缓存健康检查失败:', error);
  }

  const isHealthy = checks.database && checks.cache;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks
  });
});

// 系统状态
router.get('/status', async (req, res) => {
  const status = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString()
  };

  res.json({
    code: 200,
    data: status
  });
});

// 缓存状态
router.get('/cache', (req, res) => {
  const stats = cacheService.getStats();
  res.json({
    code: 200,
    data: stats
  });
});

// 清除缓存
router.post('/cache/clear', (req, res) => {
  cacheService.clear();
  res.json({
    code: 200,
    message: '缓存已清除'
  });
});

module.exports = router;
