/**
 * 自定义错误类
 * 提供更细粒度的错误处理
 */

/**
 * 基础操作错误类
 * 所有自定义错误的基类
 */
class OperationalError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误 - 400
 */
class ValidationError extends OperationalError {
  constructor(message = '数据验证失败', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 认证错误 - 401
 */
class AuthenticationError extends OperationalError {
  constructor(message = '认证失败', code = 'AUTHENTICATION_FAILED') {
    super(message, 401, code);
  }
}

/**
 * 授权错误 - 403
 */
class AuthorizationError extends OperationalError {
  constructor(message = '权限不足', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

/**
 * 资源未找到错误 - 404
 */
class NotFoundError extends OperationalError {
  constructor(resource = '资源', code = 'NOT_FOUND') {
    super(`${resource}不存在`, 404, code);
  }
}

/**
 * 冲突错误 - 409
 */
class ConflictError extends OperationalError {
  constructor(message = '资源冲突', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

/**
 * 频率限制错误 - 429
 */
class RateLimitError extends OperationalError {
  constructor(message = '请求过于频繁', retryAfter = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}

/**
 * 业务逻辑错误 - 422
 */
class BusinessLogicError extends OperationalError {
  constructor(message = '业务逻辑错误', code = 'BUSINESS_LOGIC_ERROR') {
    super(message, 422, code);
  }
}

/**
 * 服务不可用错误 - 503
 */
class ServiceUnavailableError extends OperationalError {
  constructor(message = '服务暂时不可用', code = 'SERVICE_UNAVAILABLE') {
    super(message, 503, code);
  }
}

module.exports = {
  OperationalError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  BusinessLogicError,
  ServiceUnavailableError,
};
