const express = require('express');
const router = express.Router();
const { sequelize, Helper, Elderly, Product, Exchange, PointsTransaction } = require('../models');
const auditLog = require('../middleware/auditLog');

// 积分兑换
router.post('/', auditLog('兑换', '积分', { description: '积分兑换商品' }), async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { target_type, target_id, items } = req.body;
    
    if (!target_type || !target_id || !items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ code: 400, message: '缺少必填字段或商品为空' });
    }
    
    // 查找目标人员
    let targetPerson;
    if (target_type === 'helper') {
      targetPerson = await Helper.findByPk(target_id, { transaction });
    } else {
      targetPerson = await Elderly.findByPk(target_id, { transaction });
    }
    
    if (!targetPerson) {
      await transaction.rollback();
      return res.status(404).json({ code: 404, message: '目标人员不存在' });
    }
    
    // 院长只能为本院人员兑换
    if (req.user.role === 'director' && targetPerson.institution_id !== req.user.institution_id) {
      await transaction.rollback();
      return res.status(403).json({ code: 403, message: '无权为其他院点人员兑换' });
    }
    
    // 计算总积分并验证库存
    let totalPoints = 0;
    const exchangeItems = [];
    
    for (const item of items) {
      const { product_id, quantity } = item;
      
      if (!product_id || !quantity || quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({ code: 400, message: '商品信息不完整' });
      }
      
      const product = await Product.findByPk(product_id, { transaction });
      
      if (!product || product.status !== 1) {
        await transaction.rollback();
        return res.status(400).json({ code: 400, message: `商品不存在或已下架` });
      }
      
      if (product.stock_quantity < quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          code: 400, 
          message: `【${product.name}】库存不足，当前库存${product.stock_quantity}` 
        });
      }
      
      const itemPoints = product.points_price * quantity;
      totalPoints += itemPoints;
      
      exchangeItems.push({
        product,
        quantity,
        itemPoints
      });
    }
    
    // 验证余额充足
    if (targetPerson.total_points < totalPoints) {
      await transaction.rollback();
      return res.status(400).json({ 
        code: 400, 
        message: `积分不足，当前余额${targetPerson.total_points}分，需要${totalPoints}分` 
      });
    }
    
    // 扣除积分
    await targetPerson.update(
      { total_points: targetPerson.total_points - totalPoints },
      { transaction }
    );
    
    // 创建兑换记录和扣减库存
    const exchangeRecords = [];
    for (const { product, quantity, itemPoints } of exchangeItems) {
      // 扣减库存
      await product.update(
        { stock_quantity: product.stock_quantity - quantity },
        { transaction }
      );
      
      // 创建兑换记录
      const exchange = await Exchange.create({
        institution_id: targetPerson.institution_id,
        target_type,
        target_id,
        target_name: targetPerson.name,
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit: product.unit,
        total_points: itemPoints,
        handler_id: req.user.id,
        exchange_date: new Date()
      }, { transaction });
      
      exchangeRecords.push(exchange);
    }
    
    // 创建积分流水记录
    await PointsTransaction.create({
      institution_id: targetPerson.institution_id,
      target_type,
      target_id,
      target_name: targetPerson.name,
      type: 'spend',
      amount: -totalPoints,
      service_category: '商品兑换',
      description: `兑换了${exchangeItems.length}种商品`,
      operator_id: req.user.id,
      operator_name: req.user.name
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      code: 200,
      message: '兑换成功',
      data: {
        target_name: targetPerson.name,
        total_points: totalPoints,
        current_balance: targetPerson.total_points,
        items_count: items.length
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('积分兑换错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
