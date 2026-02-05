/**
 * 限流中间件
 * 简单的基于内存的限流实现
 */

const requests = new Map();

// 清理过期的请求记录
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requests.entries()) {
    if (now > data.resetTime) {
      requests.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

function rateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000, // 1分钟
    maxRequests = 100,    // 最大请求数
    keyGenerator = (req) => req.ip // 默认按IP限流
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
    } else {
      const data = requests.get(key);
      
      // 检查是否需要重置
      if (now > data.resetTime) {
        data.count = 1;
        data.resetTime = now + windowMs;
      } else {
        data.count++;
      }

      // 检查是否超过限制
      if (data.count > maxRequests) {
        return res.status(429).json({
          code: 429,
          message: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((data.resetTime - now) / 1000)
        });
      }
    }

    // 添加响应头
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requests.get(key).count));
    
    next();
  };
}

// 针对不同API的限流配置
const rateLimiters = {
  // 登录接口更严格的限流
  login: rateLimiter({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
    keyGenerator: (req) => `login:${req.ip}`
  }),

  // 普通API限流
  api: rateLimiter({
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100,
    keyGenerator: (req) => `api:${req.ip}`
  }),

  // 上传接口限流
  upload: rateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyGenerator: (req) => `upload:${req.ip}`
  })
};

module.exports = { rateLimiter, rateLimiters };
