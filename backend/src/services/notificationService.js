/**
 * 通知服务
 * 用于系统通知和消息推送
 */

class NotificationService {
  constructor() {
    this.subscribers = new Map();
  }

  // 订阅通知
  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, []);
    }
    this.subscribers.get(userId).push(callback);
  }

  // 取消订阅
  unsubscribe(userId, callback) {
    if (this.subscribers.has(userId)) {
      const callbacks = this.subscribers.get(userId);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 发送通知
  notify(userId, notification) {
    if (this.subscribers.has(userId)) {
      this.subscribers.get(userId).forEach(callback => {
        callback(notification);
      });
    }
  }

  // 广播通知
  broadcast(notification) {
    this.subscribers.forEach((callbacks, userId) => {
      callbacks.forEach(callback => {
        callback(notification);
      });
    });
  }

  // 创建低库存通知
  createLowStockNotification(product) {
    return {
      type: 'warning',
      title: '库存预警',
      message: `商品【${product.name}】库存不足，当前仅剩 ${product.stock_quantity} ${product.unit}`,
      data: {
        productId: product.id,
        stock: product.stock_quantity
      },
      createdAt: new Date()
    };
  }

  // 创建积分变动通知
  createPointsChangeNotification(user, oldPoints, newPoints, reason) {
    const change = newPoints - oldPoints;
    return {
      type: change > 0 ? 'success' : 'info',
      title: change > 0 ? '积分增加' : '积分扣除',
      message: `您的积分${change > 0 ? '增加了' : '扣除了'} ${Math.abs(change)} 分，当前余额：${newPoints} 分。原因：${reason}`,
      data: {
        userId: user.id,
        change,
        oldPoints,
        newPoints,
        reason
      },
      createdAt: new Date()
    };
  }
}

module.exports = new NotificationService();
