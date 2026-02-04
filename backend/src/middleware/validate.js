/**
 * 请求参数验证中间件
 */

const { body, param, query, validationResult } = require('express-validator');

// 处理验证结果
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      message: '参数验证失败',
      errors: errors.array()
    });
  }
  next();
};

// 验证规则
const validators = {
  // 用户相关
  user: {
    create: [
      body('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度3-50字符'),
      body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
      body('role').isIn(['admin', 'director']).withMessage('角色无效'),
      body('name').trim().notEmpty().withMessage('姓名不能为空'),
      handleValidationErrors
    ],
    login: [
      body('username').trim().notEmpty().withMessage('用户名不能为空'),
      body('password').notEmpty().withMessage('密码不能为空'),
      handleValidationErrors
    ]
  },

  // 积分发放
  grant: {
    create: [
      body('institution_id').isInt().withMessage('院点ID无效'),
      body('target_type').isIn(['helper', 'elderly']).withMessage('人员类型无效'),
      body('target_id').isInt().withMessage('人员ID无效'),
      body('service_category').notEmpty().withMessage('服务类型不能为空'),
      body('image_url').notEmpty().withMessage('服务照片不能为空'),
      handleValidationErrors
    ]
  },

  // 积分兑换
  exchange: {
    create: [
      body('target_type').isIn(['helper', 'elderly']).withMessage('人员类型无效'),
      body('target_id').isInt().withMessage('人员ID无效'),
      body('items').isArray({ min: 1 }).withMessage('至少选择一个商品'),
      body('items.*.product_id').isInt().withMessage('商品ID无效'),
      body('items.*.quantity').isInt({ min: 1 }).withMessage('数量至少为1'),
      handleValidationErrors
    ]
  },

  // 商品
  product: {
    create: [
      body('name').trim().notEmpty().withMessage('商品名称不能为空'),
      body('points_price').isInt({ min: 1 }).withMessage('积分价格至少为1'),
      body('stock_quantity').isInt({ min: 0 }).withMessage('库存不能为负数'),
      handleValidationErrors
    ]
  }
};

module.exports = { validators };
