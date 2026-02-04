const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Institution, User } = require('../models');
const { checkAdmin } = require('../middleware/roleCheck');

// 获取院点列表（所有人都可以查看所有院点）
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status !== undefined) {
      where.status = status;
    }
    
    const institutions = await Institution.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'director',
        attributes: ['id', 'username', 'name']
      }]
    });
    
    res.json({ code: 200, data: institutions });
  } catch (error) {
    console.error('获取院点列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取单个院点
router.get('/:id', async (req, res) => {
  try {
    const institution = await Institution.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'director',
        attributes: ['id', 'username', 'name']
      }]
    });
    
    if (!institution) {
      return res.status(404).json({ code: 404, message: '院点不存在' });
    }
    
    res.json({ code: 200, data: institution });
  } catch (error) {
    console.error('获取院点详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建院点（仅管理员）- 同时创建院长账号
router.post('/', checkAdmin, async (req, res) => {
  const transaction = await require('../models').sequelize.transaction();
  
  try {
    const { name, address, status = 1, director_username, director_password } = req.body;
    
    if (!name) {
      await transaction.rollback();
      return res.status(400).json({ code: 400, message: '院点名称不能为空' });
    }
    
    if (!director_username || !director_password) {
      await transaction.rollback();
      return res.status(400).json({ code: 400, message: '院长账号和密码不能为空' });
    }
    
    // 检查院长账号是否已存在
    const existingUser = await User.findOne({ where: { username: director_username } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ code: 400, message: '院长账号已存在' });
    }
    
    // 创建院点
    const institution = await Institution.create({
      name,
      address,
      status
    }, { transaction });
    
    // 创建院长账号
    const password_hash = await bcrypt.hash(director_password, 10);
    const director = await User.create({
      username: director_username,
      password_hash,
      role: 'director',
      name: name + '院长',
      institution_id: institution.id
    }, { transaction });
    
    // 更新院点的 director_id
    await institution.update({ director_id: director.id }, { transaction });
    
    await transaction.commit();
    
    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: institution.id,
        name: institution.name,
        address: institution.address,
        status: institution.status,
        director: {
          id: director.id,
          username: director.username,
          name: director.name
        }
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('创建院点错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新院点（仅管理员）- 支持修改院长密码
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const { name, address, status, director_password } = req.body;
    const institution = await Institution.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'director',
        attributes: ['id', 'username', 'name']
      }]
    });
    
    if (!institution) {
      return res.status(404).json({ code: 404, message: '院点不存在' });
    }
    
    // 更新院点信息
    await institution.update({
      name: name || institution.name,
      address: address !== undefined ? address : institution.address,
      status: status !== undefined ? status : institution.status
    });
    
    // 如果提供了新密码，更新院长密码
    if (director_password && institution.director) {
      const password_hash = await bcrypt.hash(director_password, 10);
      await institution.director.update({ password_hash });
    }
    
    res.json({ code: 200, message: '更新成功', data: institution });
  } catch (error) {
    console.error('更新院点错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除院点（仅管理员）- 同时删除院长账号
router.delete('/:id', checkAdmin, async (req, res) => {
  const transaction = await require('../models').sequelize.transaction();
  
  try {
    const institution = await Institution.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'director'
      }]
    });
    
    if (!institution) {
      await transaction.rollback();
      return res.status(404).json({ code: 404, message: '院点不存在' });
    }
    
    // 删除院长账号
    if (institution.director) {
      await institution.director.destroy({ transaction });
    }
    
    // 删除院点
    await institution.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    await transaction.rollback();
    console.error('删除院点错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 重置院长密码（仅管理员）
router.post('/:id/reset-password', checkAdmin, async (req, res) => {
  try {
    const { new_password } = req.body;
    
    if (!new_password) {
      return res.status(400).json({ code: 400, message: '新密码不能为空' });
    }
    
    const institution = await Institution.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'director'
      }]
    });
    
    if (!institution) {
      return res.status(404).json({ code: 404, message: '院点不存在' });
    }
    
    if (!institution.director) {
      return res.status(404).json({ code: 404, message: '该院点未设置院长' });
    }
    
    const password_hash = await bcrypt.hash(new_password, 10);
    await institution.director.update({ password_hash });
    
    res.json({ code: 200, message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
