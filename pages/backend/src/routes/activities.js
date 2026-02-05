const express = require('express');
const router = express.Router();
const { Activity } = require('../models');
const { checkAdmin } = require('../middleware/roleCheck');

// 获取所有活动列表（管理员和院长都可用）
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status !== undefined) {
      where.status = status;
    }
    
    const activities = await Activity.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.json({ code: 200, data: activities });
  } catch (error) {
    console.error('获取活动列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取单个活动
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }
    
    res.json({ code: 200, data: activity });
  } catch (error) {
    console.error('获取活动详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建活动（仅管理员）
router.post('/', checkAdmin, async (req, res) => {
  try {
    const { name, points_per_hour, status = 1 } = req.body;
    
    if (!name || !points_per_hour) {
      return res.status(400).json({ code: 400, message: '活动名称和每小时积分不能为空' });
    }
    
    const activity = await Activity.create({
      name,
      points_per_hour,
      status
    });
    
    res.json({ code: 200, message: '创建成功', data: activity });
  } catch (error) {
    console.error('创建活动错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新活动（仅管理员）
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const { name, points_per_hour, status } = req.body;
    const activity = await Activity.findByPk(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }
    
    await activity.update({
      name: name || activity.name,
      points_per_hour: points_per_hour || activity.points_per_hour,
      status: status !== undefined ? status : activity.status
    });
    
    res.json({ code: 200, message: '更新成功', data: activity });
  } catch (error) {
    console.error('更新活动错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除活动（仅管理员）
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const activity = await Activity.findByPk(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }
    
    await activity.destroy();
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除活动错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
