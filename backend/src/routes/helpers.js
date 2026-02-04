const express = require('express');
const router = express.Router();
const { Helper } = require('../models');
const { Op } = require('sequelize');

// 获取护工列表（支持按院点筛选）
router.get('/', async (req, res) => {
  try {
    const { keyword, institution_id } = req.query;
    const where = {};
    
    // 院长只能查看本院护工
    if (req.user.role === 'director') {
      where.institution_id = req.user.institution_id;
    } else if (institution_id) {
      where.institution_id = institution_id;
    }
    
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    
    const helpers = await Helper.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.json({ code: 200, data: helpers });
  } catch (error) {
    console.error('获取护工列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 根据院点获取护工列表（用于级联选择）
router.get('/by-institution/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    
    // 院长只能查询本院
    if (req.user.role === 'director' && req.user.institution_id != institutionId) {
      return res.status(403).json({ code: 403, message: '无权查看其他院点数据' });
    }
    
    const helpers = await Helper.findAll({
      where: { institution_id: institutionId },
      attributes: ['id', 'name', 'total_points', 'institution_id'],
      order: [['name', 'ASC']]
    });
    
    res.json({ code: 200, data: helpers });
  } catch (error) {
    console.error('获取护工列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取单个护工
router.get('/:id', async (req, res) => {
  try {
    const helper = await Helper.findByPk(req.params.id);
    
    if (!helper) {
      return res.status(404).json({ code: 404, message: '护工不存在' });
    }
    
    // 院长只能查看本院护工
    if (req.user.role === 'director' && helper.institution_id !== req.user.institution_id) {
      return res.status(403).json({ code: 403, message: '无权查看此护工' });
    }
    
    res.json({ code: 200, data: helper });
  } catch (error) {
    console.error('获取护工详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建护工
router.post('/', async (req, res) => {
  try {
    const { institution_id, name } = req.body;
    
    if (!institution_id || !name) {
      return res.status(400).json({ code: 400, message: '所属院点和姓名不能为空' });
    }
    
    // 院长只能为本院创建护工
    if (req.user.role === 'director' && req.user.institution_id != institution_id) {
      return res.status(403).json({ code: 403, message: '无权为其他院点创建护工' });
    }
    
    const helper = await Helper.create({
      institution_id,
      name,
      total_points: 0
    });
    
    res.json({ code: 200, message: '创建成功', data: helper });
  } catch (error) {
    console.error('创建护工错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新护工
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const helper = await Helper.findByPk(req.params.id);
    
    if (!helper) {
      return res.status(404).json({ code: 404, message: '护工不存在' });
    }
    
    await helper.update({ name: name || helper.name });
    
    res.json({ code: 200, message: '更新成功', data: helper });
  } catch (error) {
    console.error('更新护工错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除护工
router.delete('/:id', async (req, res) => {
  try {
    const helper = await Helper.findByPk(req.params.id);
    
    if (!helper) {
      return res.status(404).json({ code: 404, message: '护工不存在' });
    }
    
    await helper.destroy();
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除护工错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
