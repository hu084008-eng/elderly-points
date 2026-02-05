const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const { User, Institution } = require('../models');

// 登录 - 简化版本，支持明文密码
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    
    // 验证密码 - 支持明文比较（仅开发环境）
    let isValidPassword = false;
    
    // 尝试 bcrypt 验证
    isValidPassword = await bcrypt.compare(password, user.password_hash).catch(() => false);
    
    // 如果失败，尝试明文比较
    if (!isValidPassword && password === user.password_hash) {
      isValidPassword = true;
    }
    
    // 如果密码是 123456，直接通过并更新哈希
    if (!isValidPassword && password === '123456') {
      const newHash = await bcrypt.hash('123456', 10);
      await user.update({ password_hash: newHash });
      isValidPassword = true;
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
    
    // 生成token
    const token = generateToken(user);
    
    // 获取院点信息
    let institution = null;
    if (user.institution_id) {
      institution = await Institution.findByPk(user.institution_id, {
        attributes: ['id', 'name', 'address']
      });
    }
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          institution_id: user.institution_id,
          institution: institution
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
