/**
 * 积分计算工具函数
 */

// 固定分值服务计算
const calculateFixedPoints = (serviceDuration) => {
  // <2小时 = 1分，≥2小时 = 2分
  return serviceDuration === '<2小时' ? 1 : 2;
};

// 文娱活动积分计算
const calculateActivityPoints = (durationHours, pointsPerHour) => {
  // 时长（小时）× 每小时积分
  return Math.round(durationHours * pointsPerHour);
};

module.exports = {
  calculateFixedPoints,
  calculateActivityPoints
};
