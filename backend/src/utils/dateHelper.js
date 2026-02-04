/**
 * 日期工具函数
 */

const dayjs = require('dayjs');

class DateHelper {
  // 格式化日期
  static format(date, format = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs(date).format(format);
  }

  // 获取当前时间
  static now() {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  }

  // 获取今天开始时间
  static startOfDay(date = new Date()) {
    return dayjs(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  }

  // 获取今天结束时间
  static endOfDay(date = new Date()) {
    return dayjs(date).endOf('day').format('YYYY-MM-DD HH:mm:ss');
  }

  // 获取本周开始时间
  static startOfWeek(date = new Date()) {
    return dayjs(date).startOf('week').format('YYYY-MM-DD HH:mm:ss');
  }

  // 获取本月开始时间
  static startOfMonth(date = new Date()) {
    return dayjs(date).startOf('month').format('YYYY-MM-DD HH:mm:ss');
  }

  // 获取本月结束时间
  static endOfMonth(date = new Date()) {
    return dayjs(date).endOf('month').format('YYYY-MM-DD HH:mm:ss');
  }

  // 添加天数
  static addDays(date, days) {
    return dayjs(date).add(days, 'day').format('YYYY-MM-DD HH:mm:ss');
  }

  // 添加月份
  static addMonths(date, months) {
    return dayjs(date).add(months, 'month').format('YYYY-MM-DD HH:mm:ss');
  }

  // 获取日期差（天数）
  static diffDays(date1, date2) {
    return dayjs(date1).diff(dayjs(date2), 'day');
  }

  // 是否为今天
  static isToday(date) {
    return dayjs(date).isSame(dayjs(), 'day');
  }

  // 是否为昨天
  static isYesterday(date) {
    return dayjs(date).isSame(dayjs().subtract(1, 'day'), 'day');
  }

  // 获取相对时间描述
  static relativeTime(date) {
    const diff = dayjs().diff(dayjs(date), 'second');
    
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
    
    return this.format(date, 'YYYY-MM-DD');
  }

  // 生成日期范围数组
  static getDateRange(startDate, endDate) {
    const dates = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    return dates;
  }

  // 获取近N天的日期数组
  static getRecentDays(n) {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      dates.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
    }
    return dates;
  }
}

module.exports = DateHelper;
