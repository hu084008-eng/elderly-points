const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'elderly-care-secret-key-2024';

// JWT验证中间件
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
};

// 生成JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      institution_id: user.institution_id,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = { authMiddleware, generateToken };
