/**
 * 院长数据范围过滤中间件
 * 自动为院长用户添加institution_id过滤条件
 */
const institutionFilter = (req, res, next) => {
  // 如果用户是院长，则添加机构过滤
  if (req.user.role === 'director' && req.user.institution_id) {
    req.institutionFilter = { institution_id: req.user.institution_id };
  } else {
    req.institutionFilter = {};
  }
  next();
};

module.exports = institutionFilter;
