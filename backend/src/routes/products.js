const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { checkAdmin } = require('../middleware/roleCheck');

// 获取商品列表（管理员和院长都可用）
router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query;
    const where = {};
    
    if (status !== undefined) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    const products = await Product.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.json({ code: 200, data: products });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    

    res.json({ code: 200, data: product });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建商品（仅管理员）
router.post('/', checkAdmin, async (req, res) => {
  try {
    const { name, category, points_price, stock_quantity, unit, status = 1 } = req.body;
    
    if (!name || !points_price) {
      return res.status(400).json({ code: 400, message: '商品名称和兑换积分不能为空' });
    }
    
    const product = await Product.create({
      name,
      category,
      points_price,
      stock_quantity: stock_quantity || 0,
      unit,
      status
    });
    
    res.json({ code: 200, message: '创建成功', data: product });
  } catch (error) {
    console.error('创建商品错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新商品（仅管理员）
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const { name, category, points_price, stock_quantity, unit, status } = req.body;
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    
    await product.update({
      name: name || product.name,
      category: category || product.category,
      points_price: points_price !== undefined ? points_price : product.points_price,
      stock_quantity: stock_quantity !== undefined ? stock_quantity : product.stock_quantity,
      unit: unit !== undefined ? unit : product.unit,
      status: status !== undefined ? status : product.status
    });
    
    res.json({ code: 200, message: '更新成功', data: product });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除商品（仅管理员）
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    
    await product.destroy();
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
