/**
 * 响应工具函数
 */

class ResponseHelper {
  // 成功响应
  static success(res, data = null, message = '操作成功') {
    return res.json({
      code: 200,
      message,
      data,
      timestamp: Date.now()
    });
  }

  // 错误响应
  static error(res, message = '操作失败', code = 500, statusCode = 200) {
    return res.status(statusCode).json({
      code,
      message,
      timestamp: Date.now()
    });
  }

  // 分页响应
  static paginate(res, list, pagination, message = '查询成功') {
    return res.json({
      code: 200,
      message,
      data: {
        list,
        pagination: {
          ...pagination,
          total_pages: Math.ceil(pagination.total / pagination.page_size)
        }
      },
      timestamp: Date.now()
    });
  }

  // 创建成功
  static created(res, data, message = '创建成功') {
    return res.status(201).json({
      code: 201,
      message,
      data,
      timestamp: Date.now()
    });
  }

  // 无内容
  static noContent(res) {
    return res.status(204).send();
  }

  // 参数错误
  static badRequest(res, message = '参数错误') {
    return this.error(res, message, 400, 400);
  }

  // 未授权
  static unauthorized(res, message = '请先登录') {
    return this.error(res, message, 401, 401);
  }

  // 禁止访问
  static forbidden(res, message = '权限不足') {
    return this.error(res, message, 403, 403);
  }

  // 资源不存在
  static notFound(res, message = '资源不存在') {
    return this.error(res, message, 404, 404);
  }

  // 服务器错误
  static serverError(res, message = '服务器内部错误') {
    return this.error(res, message, 500, 500);
  }
}

module.exports = ResponseHelper;
