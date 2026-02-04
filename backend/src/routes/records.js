const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { PointsTransaction, Exchange, Institution, Helper, Elderly, sequelize } = require('../models');
const { exportTransactionsToExcel, exportExchangesToExcel } = require('../utils/exportHelper');

// 获取积分流水列表
router.get('/transactions', async (req, res) => {
  try {
    const { 
      institution_id, 
      target_type, 
      type, 
      service_category,
      start_date,
      end_date,
      page = 1,
      page_size = 20
    } = req.query;
    
    const where = {};
    
    // 院长只能查看本院数据
    if (req.user.role === 'director') {
      where.institution_id = req.user.institution_id;
    } else if (institution_id) {
      where.institution_id = institution_id;
    }
    
    if (target_type) {
      where.target_type = target_type;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (service_category) {
      where.service_category = service_category;
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
    
    const { count, rows } = await PointsTransaction.findAndCountAll({
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
    console.error('获取流水列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取兑换记录列表
router.get('/exchanges', async (req, res) => {
  try {
    const { 
      institution_id, 
      target_type,
      start_date,
      end_date,
      page = 1,
      page_size = 20
    } = req.query;
    
    const where = {};
    
    // 院长只能查看本院数据
    if (req.user.role === 'director') {
      where.institution_id = req.user.institution_id;
    } else if (institution_id) {
      where.institution_id = institution_id;
    }
    
    if (target_type) {
      where.target_type = target_type;
    }
    
    if (start_date || end_date) {
      where.exchange_date = {};
      if (start_date) {
        where.exchange_date[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        where.exchange_date[Op.lte] = new Date(end_date + ' 23:59:59');
      }
    }
    
    const offset = (page - 1) * page_size;
    const limit = parseInt(page_size);
    
    const { count, rows } = await Exchange.findAndCountAll({
      where,
      order: [['exchange_date', 'DESC']],
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
    console.error('获取兑换记录错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取统计数据
router.get('/statistics', async (req, res) => {
  try {
    const { institution_id, start_date, end_date } = req.query;
    
    let institutionFilter = '';
    let institutionParams = [];
    
    if (req.user.role === 'director') {
      institutionFilter = 'WHERE institution_id = ?';
      institutionParams = [req.user.institution_id];
    } else if (institution_id) {
      institutionFilter = 'WHERE institution_id = ?';
      institutionParams = [institution_id];
    }
    
    // 日期过滤
    let dateFilter = '';
    if (start_date) {
      dateFilter = institutionFilter ? ' AND' : 'WHERE';
      dateFilter += ` created_at >= ?`;
      institutionParams.push(start_date);
    }
    if (end_date) {
      dateFilter = (institutionFilter || start_date) ? ' AND' : 'WHERE';
      dateFilter += ` created_at <= ?`;
      institutionParams.push(end_date + ' 23:59:59');
    }
    
    // 发放统计
    const [grantStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN type = 'earn' THEN amount ELSE 0 END) as total_earned,
        SUM(CASE WHEN type = 'spend' THEN ABS(amount) ELSE 0 END) as total_spent
      FROM points_transactions
      ${institutionFilter}
      ${dateFilter}
    `, {
      replacements: institutionParams
    });
    
    // 按服务类型统计
    const categoryWhere = institutionFilter || dateFilter ? 'AND' : 'WHERE';
    const [categoryStats] = await sequelize.query(`
      SELECT 
        service_category,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM points_transactions
      ${institutionFilter}
      ${dateFilter}
      ${categoryWhere} service_category IS NOT NULL
      GROUP BY service_category
    `, {
      replacements: institutionParams
    });
    
    // 兑换统计
    const [exchangeStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_exchanges,
        SUM(total_points) as total_points_spent,
        SUM(quantity) as total_items
      FROM exchanges
      ${institutionFilter}
      ${dateFilter.replace(/created_at/g, 'exchange_date')}
    `, {
      replacements: institutionParams
    });
    
    // 人员统计
    let personWhere = {};
    if (req.user.role === 'director') {
      personWhere = { institution_id: req.user.institution_id };
    } else if (institution_id) {
      personWhere = { institution_id };
    }
    
    const helperCount = await Helper.count({ where: personWhere });
    const elderlyCount = await Elderly.count({ where: personWhere });
    
    res.json({
      code: 200,
      data: {
        grant: grantStats[0] || { total_count: 0, total_earned: 0, total_spent: 0 },
        category: categoryStats,
        exchange: exchangeStats[0] || { total_exchanges: 0, total_points_spent: 0, total_items: 0 },
        persons: {
          helpers: helperCount,
          elderly: elderlyCount
        }
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 导出积分流水
router.get('/export/transactions', async (req, res) => {
  try {
    const { institution_id, start_date, end_date } = req.query;
    
    const where = {};
    if (req.user.role === 'director') {
      where.institution_id = req.user.institution_id;
    } else if (institution_id) {
      where.institution_id = institution_id;
    }
    
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date + ' 23:59:59');
    }

    const transactions = await PointsTransaction.findAll({ where, order: [['created_at', 'DESC']] });
    
    // 获取院点名称
    const institutionIds = [...new Set(transactions.map(t => t.institution_id))];
    const institutions = await Institution.findAll({ where: { id: institutionIds } });
    const instMap = {};
    institutions.forEach(i => instMap[i.id] = i.name);
    
    transactions.forEach(t => t.institution_name = instMap[t.institution_id]);

    const workbook = await exportTransactionsToExcel(transactions);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=积分流水.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('导出流水错误:', error);
    res.status(500).json({ code: 500, message: '导出失败' });
  }
});

// 导出兑换记录
router.get('/export/exchanges', async (req, res) => {
  try {
    const { institution_id, start_date, end_date } = req.query;
    
    const where = {};
    if (req.user.role === 'director') {
      where.institution_id = req.user.institution_id;
    } else if (institution_id) {
      where.institution_id = institution_id;
    }
    
    if (start_date || end_date) {
      where.exchange_date = {};
      if (start_date) where.exchange_date[Op.gte] = new Date(start_date);
      if (end_date) where.exchange_date[Op.lte] = new Date(end_date + ' 23:59:59');
    }

    const exchanges = await Exchange.findAll({ where, order: [['exchange_date', 'DESC']] });
    
    const institutionIds = [...new Set(exchanges.map(e => e.institution_id))];
    const institutions = await Institution.findAll({ where: { id: institutionIds } });
    const instMap = {};
    institutions.forEach(i => instMap[i.id] = i.name);
    
    exchanges.forEach(e => e.institution_name = instMap[e.institution_id]);

    const workbook = await exportExchangesToExcel(exchanges);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=兑换记录.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('导出兑换记录错误:', error);
    res.status(500).json({ code: 500, message: '导出失败' });
  }
});

module.exports = router;
