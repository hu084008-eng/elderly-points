const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Institution } = require('../models');
const { checkAdmin } = require('../middleware/roleCheck');

// 获取用户列表（仅管理员）
router.get('/', checkAdmin, async (req, res) => {
  try {
    const { role } = req.query;
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    const users = await User.findAll({
      where,
      attributes: ['id', 'username', 'role', 'name', 'phone', 'institution_id', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    
    // 获取院点信息
    const institutionIds = [...new Set(users.filter(u => u.institution_id).map(u => u.institution_id))];
    const institutions = await Institution.findAll({
      where: { id: institutionIds },
      attributes: ['id', 'name']
    });
    
    const institutionMap = {};
    institutions.forEach(inst => {
      institutionMap[inst.id] = inst.name;
    });
    
    const formattedUsers = users.map(user => ({
      ...user.toJSON(),
      institution_name: institutionMap[user.institution_id] || null
    }));
    
    res.json({ code: 200, data: formattedUsers });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取单个用户
router.get('/:id', checkAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'role', 'name', 'phone', 'institution_id', 'created_at']
    });
    
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    res.json({ code: 200, data: user });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建用户/院长账号（仅管理员）
router.post('/', checkAdmin, async (req, res) => {
  try {
    const { username, password, role, name, phone, institution_id } = req.body;
    
    if (!username || !password || !role || !name) {
      return res.status(400).json({ code: 400, message: '用户名、密码、角色和姓名不能为空' });
    }
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ code: 400, message: '用户名已存在' });
    }
    
    // 院长必须绑定院点
    if (role === 'director' && !institution_id) {
      return res.status(400).json({ code: 400, message: '院长账号必须绑定院点' });
    }
    
    // 加密密码
    const password_hash = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      password_hash,
      role,
      name,
      phone,
      institution_id: role === 'director' ? institution_id : null
    });
    
    // 如果是院长，更新院点的director_id
    if (role === 'director' && institution_id) {
      await Institution.update(
        { director_id: user.id },
        { where: { id: institution_id } }
      );
    }
    
    res.json({
      code: 200,
      message: '创建成功',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        institution_id: user.institution_id
      }
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新用户（仅管理员）
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const { name, phone, institution_id, status } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    // 不能修改自己的角色
    if (req.user.id === parseInt(req.params.id) && req.body.role && req.body.role !== user.role) {
      return res.status(400).json({ code: 400, message: '不能修改自己的角色' });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (institution_id !== undefined && user.role === 'director') {
      updateData.institution_id = institution_id;
      // 更新院点的director_id
      await Institution.update(
        { director_id: user.id },
        { where: { id: institution_id } }
      );
    }
    
    await user.update(updateData);
    
    res.json({ code: 200, message: '更新成功', data: user });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 重置密码（仅管理员）
router.post('/:id/reset-password', checkAdmin, async (req, res) => {
  try {
    const { new_password } = req.body;
    
    if (!new_password) {
      return res.status(400).json({ code: 400, message: '新密码不能为空' });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    const password_hash = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash });
    
    res.json({ code: 200, message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除用户（仅管理员）
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    
    // 不能删除自己
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ code: 400, message: '不能删除自己的账号' });
    }
    
    // 如果删除院长，清除院点的director_id
    if (user.role === 'director' && user.institution_id) {
      await Institution.update(
        { director_id: null },
        { where: { id: user.institution_id } }
      );
    }
    
    await user.destroy();
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
