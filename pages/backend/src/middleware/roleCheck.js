// 检查是否为管理员
const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '权限不足，仅管理员可操作' });
  }
  next();
};

// 检查是否为院长
const checkDirector = (req, res, next) => {
  if (req.user.role !== 'director') {
    return res.status(403).json({ code: 403, message: '权限不足，仅院长可操作' });
  }
  next();
};

// 检查是否为管理员或院长
const checkAdminOrDirector = (req, res, next) => {
  if (!['admin', 'director'].includes(req.user.role)) {
    return res.status(403).json({ code: 403, message: '权限不足' });
  }
  next();
};

module.exports = { checkAdmin, checkDirector, checkAdminOrDirector };
