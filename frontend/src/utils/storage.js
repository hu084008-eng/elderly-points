/**
 * 本地存储工具函数
 */

const prefix = 'elderly_care_'

export const storage = {
  // 设置
  set(key, value, expire = null) {
    const data = {
      value,
      time: Date.now(),
      expire: expire ? Date.now() + expire * 1000 : null
    }
    localStorage.setItem(prefix + key, JSON.stringify(data))
  },

  // 获取
  get(key, defaultValue = null) {
    const item = localStorage.getItem(prefix + key)
    if (!item) return defaultValue
    
    try {
      const data = JSON.parse(item)
      
      // 检查是否过期
      if (data.expire && Date.now() > data.expire) {
        this.remove(key)
        return defaultValue
      }
      
      return data.value
    } catch {
      return defaultValue
    }
  },

  // 删除
  remove(key) {
    localStorage.removeItem(prefix + key)
  },

  // 清空
  clear() {
    // 只清空当前应用的数据
    Object.keys(localStorage)
      .filter(key => key.startsWith(prefix))
      .forEach(key => localStorage.removeItem(key))
  },

  // 获取所有键
  keys() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(prefix))
      .map(key => key.substring(prefix.length))
  }
}

export const sessionStorage = {
  set(key, value) {
    window.sessionStorage.setItem(prefix + key, JSON.stringify(value))
  },

  get(key, defaultValue = null) {
    const item = window.sessionStorage.getItem(prefix + key)
    if (!item) return defaultValue
    try {
      return JSON.parse(item)
    } catch {
      return defaultValue
    }
  },

  remove(key) {
    window.sessionStorage.removeItem(prefix + key)
  },

  clear() {
    Object.keys(window.sessionStorage)
      .filter(key => key.startsWith(prefix))
      .forEach(key => window.sessionStorage.removeItem(key))
  }
}
