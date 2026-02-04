const SystemLog = require('../models/SystemLog');

/**
 * 审计日志中间件
 * 记录用户的操作行为
 */
const auditLog = (action, module, options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // 记录原始响应方法
    const originalSend = res.send;
    
    res.send = function(body) {
      // 恢复原始方法
      res.send = originalSend;
      
      // 异步记录日志，不阻塞响应
      const duration = Date.now() - startTime;
      
      const logData = {
        user_id: req.user?.id,
        username: req.user?.username,
        action,
        module,
        description: options.description || `${req.user?.username} ${action} ${module}`,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        request_data: options.includeData ? { body: req.body, params: req.params, query: req.query } : null,
        response_status: res.statusCode
      };
      
      // 异步保存，不等待
      SystemLog.create(logData).catch(err => {
        console.error('保存审计日志失败:', err);
      });
      
      // 调用原始响应方法
      return res.send(body);
    };
    
    next();
  };
};

module.exports = auditLog;
