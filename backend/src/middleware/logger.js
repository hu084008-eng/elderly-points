const logger = (req, res, next) => {
  const timestamp = new Date().toISOString()
  const { method, url, body } = req
  const user = req.user ? `[${req.user.username}]` : '[匿名]'
  
  // 记录请求
  console.log(`[${timestamp}] ${user} ${method} ${url}`)
  
  // 记录响应时间
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    console.log(`[${timestamp}] ${method} ${url} - ${status} - ${duration}ms`)
  })
  
  next()
}

module.exports = logger
