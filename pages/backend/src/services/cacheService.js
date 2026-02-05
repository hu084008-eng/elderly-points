/**
 * 缓存服务
 * 简单的内存缓存实现
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  // 设置缓存
  set(key, value, ttl = 3600) {
    // 清除旧的定时器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, {
      value,
      expireAt: Date.now() + ttl * 1000
    });

    // 设置过期定时器
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  // 获取缓存
  get(key) {
    const data = this.cache.get(key);
    if (!data) return null;

    // 检查是否过期
    if (Date.now() > data.expireAt) {
      this.delete(key);
      return null;
    }

    return data.value;
  }

  // 删除缓存
  delete(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  // 获取或设置缓存
  async getOrSet(key, factory, ttl = 3600) {
    let value = this.get(key);
    if (value === null) {
      value = await factory();
      this.set(key, value, ttl);
    }
    return value;
  }

  // 清空所有缓存
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  // 获取缓存统计
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // 清除过期的缓存
  clearExpired() {
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (now > data.expireAt) {
        this.delete(key);
      }
    }
  }
}

module.exports = new CacheService();
