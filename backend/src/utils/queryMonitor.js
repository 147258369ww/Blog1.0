const logger = require('./logger');

/**
 * 数据库查询性能监控工具
 */
class QueryMonitor {
  constructor() {
    // 慢查询阈值（毫秒）
    this.slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD, 10) || 1000;
    // 是否启用查询监控
    this.enabled = process.env.ENABLE_QUERY_MONITOR !== 'false';
  }

  /**
   * 监控查询执行时间
   * @param {Function} queryFn - 查询函数
   * @param {string} queryName - 查询名称
   * @param {Object} params - 查询参数
   * @returns {Promise<any>} 查询结果
   */
  async monitor(queryFn, queryName, params = {}) {
    if (!this.enabled) {
      return await queryFn();
    }

    const startTime = Date.now();
    let result;
    let error;

    try {
      result = await queryFn();
    } catch (err) {
      error = err;
    }

    const duration = Date.now() - startTime;

    // 记录慢查询
    if (duration > this.slowQueryThreshold) {
      logger.warn('Slow query detected', {
        queryName,
        duration: `${duration}ms`,
        threshold: `${this.slowQueryThreshold}ms`,
        params: this.sanitizeParams(params),
      });
    }

    // 记录查询错误
    if (error) {
      logger.error('Query error', {
        queryName,
        duration: `${duration}ms`,
        error: error.message,
        params: this.sanitizeParams(params),
      });
      throw error;
    }

    // 在开发环境记录所有查询
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      logger.debug('Query executed', {
        queryName,
        duration: `${duration}ms`,
      });
    }

    return result;
  }

  /**
   * 清理敏感参数
   * @param {Object} params - 原始参数
   * @returns {Object} 清理后的参数
   */
  sanitizeParams(params) {
    const sanitized = { ...params };
    
    // 移除敏感字段
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * 创建查询包装器
   * @param {string} queryName - 查询名称
   * @returns {Function} 包装器函数
   */
  wrap(queryName) {
    return async (queryFn, params = {}) => {
      return await this.monitor(queryFn, queryName, params);
    };
  }
}

module.exports = new QueryMonitor();
