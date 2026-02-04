const express = require('express');
const router = express.Router();
const { sequelize, Helper, Elderly, Activity, PointsTransaction } = require('../models');
const { calculateFixedPoints, calculateActivityPoints } = require('../utils/calculator');
const auditLog = require('../middleware/auditLog');

// 获取人员列表（用于级联选择）
router.get('/persons', async (req, res) => {
  try {
    const { institution_id, type } = req.query;
    
    if (!institution_id || !type) {
      return res.status(400).json({ code: 400, message: '院点和人员类型不能为空' });
    }
    
    // 院长只能查询本院
    if (req.user.role === 'director' && req.user.institution_id != institution_id) {
      return res.status(403).json({ code: 403, message: '无权查看其他院点数据' });
    }
    
    let persons = [];
    if (type === 'helper') {
      persons = await Helper.findAll({
        where: { institution_id },
        attributes: ['id', 'name', 'total_points', 'institution_id'],
        order: [['name', 'ASC']]
      });
    } else if (type === 'elderly') {
      persons = await Elderly.findAll({
        where: { institution_id },
        attributes: ['id', 'name', 'total_points', 'institution_id'],
        order: [['name', 'ASC']]
      });
    }
    
    // 格式化返回数据
    const formattedPersons = persons.map(p => ({
      id: p.id,
      name: p.name,
      total_points: p.total_points,
      display_name: `${p.name} - 当前${p.total_points}分`
    }));
    
    res.json({ code: 200, data: formattedPersons });
  } catch (error) {
    console.error('获取人员列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 积分发放
router.post('/', auditLog('发放积分', '积分', { description: '发放积分' }), async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      institution_id,
      target_type,
      target_id,
      service_category,
      service_duration,
      activity_id,
      duration_hours,
      description,
      image_url
    } = req.body;
    
    // 验证必填字段
    if (!institution_id || !target_type || !target_id || !service_category) {
      await transaction.rollback();
      return res.status(400).json({ code: 400, message: '缺少必填字段' });
    }
    
    // 验证照片已上传
    if (!image_url) {
      await transaction.rollback();
      return res.status(400).json({ code: 400, message: '请上传服务照片' });
    }
    
    // 所有人都可以为任意院点发放积分
    
    // 计算积分
    let amount = 0;
    let calculationType = 'fixed';
    let activityName = null;
    let pointsPerHour = null;
    let finalServiceDuration = service_duration;
    
    if (service_category === '文娱活动') {
      // 文娱活动：动态计算
      if (!activity_id || !duration_hours) {
        await transaction.rollback();
        return res.status(400).json({ code: 400, message: '文娱活动需要选择活动类型和填写时长' });
      }
      
      const activity = await Activity.findByPk(activity_id);
      if (!activity || activity.status !== 1) {
        await transaction.rollback();
        return res.status(400).json({ code: 400, message: '活动类型不存在或已停用' });
      }
      
      calculationType = 'dynamic';
      amount = calculateActivityPoints(duration_hours, activity.points_per_hour);
      activityName = activity.name;
      pointsPerHour = activity.points_per_hour;
      finalServiceDuration = `${duration_hours}小时`;
    } else {
      // 固定分值服务
      if (!service_duration) {
        await transaction.rollback();
        return res.status(400).json({ code: 400, message: '请选择服务时长' });
      }
      amount = calculateFixedPoints(service_duration);
    }
    
    // 查找目标人员
    let targetPerson;
    if (target_type === 'helper') {
      targetPerson = await Helper.findOne({
        where: { id: target_id, institution_id },
        transaction
      });
    } else {
      targetPerson = await Elderly.findOne({
        where: { id: target_id, institution_id },
        transaction
      });
    }
    
    if (!targetPerson) {
      await transaction.rollback();
      return res.status(404).json({ code: 404, message: '目标人员不存在或不属于该院' });
    }
    
    // 更新积分余额
    await targetPerson.update(
      { total_points: targetPerson.total_points + amount },
      { transaction }
    );
    
    // 创建流水记录
    const pointsTransaction = await PointsTransaction.create({
      institution_id,
      target_type,
      target_id,
      target_name: targetPerson.name,
      type: 'earn',
      amount,
      service_category,
      service_duration: finalServiceDuration,
      calculation_type: calculationType,
      activity_id: activity_id || null,
      activity_name: activityName,
      points_per_hour: pointsPerHour,
      description,
      image_url,
      operator_id: req.user.id,
      operator_name: req.user.name
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      code: 200,
      message: '发放成功',
      data: {
        transaction_id: pointsTransaction.id,
        target_name: targetPerson.name,
        amount,
        current_balance: targetPerson.total_points
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('积分发放错误:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router;
