/**
 * 分页工具函数
 */

class PaginationHelper {
  // 获取分页参数
  static getParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const page_size = Math.min(100, Math.max(1, parseInt(query.page_size) || 20));
    const offset = (page - 1) * page_size;

    return { page, page_size, offset, limit: page_size };
  }

  // 创建分页元数据
  static createMeta(total, page, page_size) {
    return {
      total,
      page,
      page_size,
      total_pages: Math.ceil(total / page_size),
      has_next: page * page_size < total,
      has_prev: page > 1
    };
  }

  // 格式化分页响应
  static format(list, total, page, page_size) {
    return {
      list,
      pagination: this.createMeta(total, page, page_size)
    };
  }

  // 游标分页（适用于大数据量）
  static getCursorParams(query, defaultLimit = 20) {
    const limit = Math.min(100, parseInt(query.limit) || defaultLimit);
    const cursor = query.cursor || null;
    const direction = query.direction || 'next'; // next 或 prev

    return { limit, cursor, direction };
  }
}

module.exports = PaginationHelper;
