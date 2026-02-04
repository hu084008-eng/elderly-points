/**
 * 自定义异常类
 */

class AppError extends Error {
  constructor(message, code = 500, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message = '参数验证失败') { super(message, 400, 400); }
}

class UnauthorizedError extends AppError {
  constructor(message = '未授权') { super(message, 401, 401); }
}

class ForbiddenError extends AppError {
  constructor(message = '权限不足') { super(message, 403, 403); }
}

class NotFoundError extends AppError {
  constructor(message = '资源不存在') { super(message, 404, 404); }
}

module.exports = { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError };
