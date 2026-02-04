/**
 * 定时任务服务
 */

class SchedulerService {
  constructor() {
    this.tasks = new Map();
  }

  // 添加定时任务
  add(name, cronExpression, task) {
    // 简单的定时任务实现，生产环境建议使用 node-cron
    const interval = this.parseCron(cronExpression);
    const timer = setInterval(task, interval);
    this.tasks.set(name, { timer, task, cronExpression });
    console.log(`[Scheduler] 任务 ${name} 已添加，执行间隔: ${interval}ms`);
  }

  // 移除定时任务
  remove(name) {
    if (this.tasks.has(name)) {
      clearInterval(this.tasks.get(name).timer);
      this.tasks.delete(name);
      console.log(`[Scheduler] 任务 ${name} 已移除`);
    }
  }

  // 立即执行任务
  runNow(name) {
    if (this.tasks.has(name)) {
      this.tasks.get(name).task();
      console.log(`[Scheduler] 任务 ${name} 已立即执行`);
    }
  }

  // 简单的Cron解析（仅支持基本格式）
  parseCron(cron) {
    // 简化实现：将 cron 转换为毫秒
    // 例如：*/5 * * * * -> 5分钟
    // 0 0 * * * -> 24小时
    const parts = cron.split(' ');
    if (parts[0].startsWith('*/')) {
      const minutes = parseInt(parts[0].replace('*/', ''));
      return minutes * 60 * 1000;
    }
    if (parts[0] === '0' && parts[1] === '0') {
      return 24 * 60 * 60 * 1000;
    }
    // 默认5分钟
    return 5 * 60 * 1000;
  }

  // 获取所有任务
  getTasks() {
    return Array.from(this.tasks.keys());
  }

  // 初始化默认任务
  initDefaultTasks() {
    // 清理过期日志 - 每天执行
    this.add('cleanup-logs', '0 0 * * *', async () => {
      console.log('[Scheduler] 执行日志清理任务');
      // 调用日志清理逻辑
    });

    // 清理过期缓存 - 每小时执行
    this.add('cleanup-cache', '0 * * * *', () => {
      console.log('[Scheduler] 执行缓存清理任务');
      const cacheService = require('./cacheService');
      cacheService.clearExpired();
    });

    // 数据备份 - 每天凌晨执行
    this.add('backup-data', '0 2 * * *', () => {
      console.log('[Scheduler] 执行数据备份任务');
      // 调用备份逻辑
    });
  }
}

module.exports = new SchedulerService();
