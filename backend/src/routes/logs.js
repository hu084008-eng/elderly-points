const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { SystemLog, sequelize } = require('../models');
const { checkAdmin } = require('../middleware/roleCheck');

// 获取系统日志列表（仅管理员）
router.get('/', checkAdmin, async (req, res) => {
  try {
    const { 
      user_id, 
      action, 
      module,
      start_date,
      end_date,
      page = 1,
      page_size = 20
    } = req.query;
    
    const where = {};
    
    if (user_id) {
      where.user_id = user_id;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (module) {
      where.module = module;
    }
    
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) {
        where.created_at[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        where.created_at[Op.lte] = new Date(end_date + ' 23:59:59');
      }
    }
    
    const offset = (page - 1) * page_size;
    const limit = parseInt(page_size);
    
    const { count, rows } = await SystemLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset,
      limit
    });
    
    res.json({
      code: 200,
      data: {
        list: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          page_size: parseInt(page_size),
          total_pages: Math.ceil(count / page_size)
        }
      }
    });
  } catch (error) {
    console.error('获取系统日志错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取操作类型统计（仅管理员）
router.get('/statistics', checkAdmin, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let where = '';
    let params = [];
    
    if (start_date) {
      where += ' AND created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      where += ' AND created_at <= ?';
      params.push(end_date + ' 23:59:59');
    }
    
    // 按操作类型统计
    const [actionStats] = await sequelize.query(`
      SELECT action, COUNT(*) as count
      FROM system_logs
      WHERE 1=1 ${where}
      GROUP BY action
      ORDER BY count DESC
    `, { replacements: params });
    
    // 按模块统计
    const [moduleStats] = await sequelize.query(`
      SELECT module, COUNT(*) as count
      FROM system_logs
      WHERE 1=1 ${where}
      GROUP BY module
      ORDER BY count DESC
    `, { replacements: params });
    
    // 按用户统计
    const [userStats] = await sequelize.query(`
      SELECT username, COUNT(*) as count
      FROM system_logs
      WHERE 1=1 ${where}
      GROUP BY username
      ORDER BY count DESC
      LIMIT 10
    `, { replacements: params });
    
    res.json({
      code: 200,
      data: {
        action: actionStats,
        module: moduleStats,
        user: userStats
      }
    });
  } catch (error) {
    console.error('获取日志统计错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 清理旧日志（仅管理员）
router.post('/cleanup', checkAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await SystemLog.destroy({
      where: {
        created_at: {
          [Op.lt]: cutoffDate
        }
      }
    });
    
    res.json({
      code: 200,
      message: `已清理 ${result} 条日志`,
      data: { deleted_count: result }
    });
  } catch (error) {
    console.error('清理日志错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
