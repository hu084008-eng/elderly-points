const express = require('express');
const router = express.Router();
const { ServiceRule } = require('../models');

// 获取所有服务规则
router.get('/', async (req, res) => {
  try {
    const rules = await ServiceRule.findAll({
      order: [['id', 'ASC']]
    });
    res.json({ code: 200, data: rules });
  } catch (error) {
    console.error('获取服务规则失败:', error);
    res.status(500).json({ code: 500, message: '获取服务规则失败' });
  }
});

// 获取单个规则
router.get('/:id', async (req, res) => {
  try {
    const rule = await ServiceRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ code: 404, message: '规则不存在' });
    }
    res.json({ code: 200, data: rule });
  } catch (error) {
    console.error('获取规则失败:', error);
    res.status(500).json({ code: 500, message: '获取规则失败' });
  }
});

// 创建规则
router.post('/', async (req, res) => {
  try {
    const rule = await ServiceRule.create(req.body);
    res.json({ code: 200, message: '创建成功', data: rule });
  } catch (error) {
    console.error('创建规则失败:', error);
    res.status(500).json({ code: 500, message: '创建规则失败' });
  }
});

// 更新规则
router.put('/:id', async (req, res) => {
  try {
    const rule = await ServiceRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ code: 404, message: '规则不存在' });
    }
    await rule.update(req.body);
    res.json({ code: 200, message: '更新成功', data: rule });
  } catch (error) {
    console.error('更新规则失败:', error);
    res.status(500).json({ code: 500, message: '更新规则失败' });
  }
});

// 删除规则
router.delete('/:id', async (req, res) => {
  try {
    const rule = await ServiceRule.findByPk(req.params.id);
    if (!rule) {
      return res.status(404).json({ code: 404, message: '规则不存在' });
    }
    await rule.destroy();
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除规则失败:', error);
    res.status(500).json({ code: 500, message: '删除规则失败' });
  }
});

module.exports = router;
