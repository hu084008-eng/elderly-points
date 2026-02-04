const express = require('express');
const router = express.Router();
const { Elderly } = require('../models');
const { Op } = require('sequelize');

// 获取老人列表（支持按院点筛选）
router.get('/', async (req, res) => {
  try {
    const { keyword, institution_id } = req.query;
    const where = {};
    
    // 院长只能查看本院老人
    if (req.user.role === 'director') {
      where.institution_id = req.user.institution_id;
    } else if (institution_id) {
      where.institution_id = institution_id;
    }
    
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    
    const elderly = await Elderly.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.json({ code: 200, data: elderly });
  } catch (error) {
    console.error('获取老人列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 根据院点获取老人列表（用于级联选择）
router.get('/by-institution/:institutionId', async (req, res) => {
  try {
    const { institutionId } = req.params;
    
    // 院长只能查询本院
    if (req.user.role === 'director' && req.user.institution_id != institutionId) {
      return res.status(403).json({ code: 403, message: '无权查看其他院点数据' });
    }
    
    const elderly = await Elderly.findAll({
      where: { institution_id: institutionId },
      attributes: ['id', 'name', 'total_points', 'institution_id'],
      order: [['name', 'ASC']]
    });
    
    res.json({ code: 200, data: elderly });
  } catch (error) {
    console.error('获取老人列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取单个老人
router.get('/:id', async (req, res) => {
  try {
    const elderly = await Elderly.findByPk(req.params.id);
    
    if (!elderly) {
      return res.status(404).json({ code: 404, message: '老人不存在' });
    }
    
    // 院长只能查看本院老人
    if (req.user.role === 'director' && elderly.institution_id !== req.user.institution_id) {
      return res.status(403).json({ code: 403, message: '无权查看此老人' });
    }
    
    res.json({ code: 200, data: elderly });
  } catch (error) {
    console.error('获取老人详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建老人
router.post('/', async (req, res) => {
  try {
    const { institution_id, name } = req.body;
    
    if (!institution_id || !name) {
      return res.status(400).json({ code: 400, message: '所属院点和姓名不能为空' });
    }
    
    // 院长只能为本院创建老人
    if (req.user.role === 'director' && req.user.institution_id != institution_id) {
      return res.status(403).json({ code: 403, message: '无权为其他院点创建老人' });
    }
    
    const elderly = await Elderly.create({
      institution_id,
      name,
      total_points: 0
    });
    
    res.json({ code: 200, message: '创建成功', data: elderly });
  } catch (error) {
    console.error('创建老人错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新老人
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const elderly = await Elderly.findByPk(req.params.id);
    
    if (!elderly) {
      return res.status(404).json({ code: 404, message: '老人不存在' });
    }
    
    await elderly.update({ name: name || elderly.name });
    
    res.json({ code: 200, message: '更新成功', data: elderly });
  } catch (error) {
    console.error('更新老人错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除老人
router.delete('/:id', async (req, res) => {
  try {
    const elderly = await Elderly.findByPk(req.params.id);
    
    if (!elderly) {
      return res.status(404).json({ code: 404, message: '老人不存在' });
    }
    
    await elderly.destroy();
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除老人错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
