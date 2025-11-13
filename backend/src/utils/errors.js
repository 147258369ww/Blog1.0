/**
 * Base class for custom errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 400
 * Used when request validation fails
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * Authentication Error - 401
 * Used when authentication fails or token is invalid
 */
class AuthenticationError extends AppError {
  constructor(message = '未授权访问') {
    super(message, 401);
  }
}

/**
 * Authorization Error - 403
 * Used when user doesn't have permission to access resource
 */
class AuthorizationError extends AppError {
  constructor(message = '权限不足') {
    super(message, 403);
  }
}

/**
 * Not Found Error - 404
 * Used when requested resource is not found
 */
class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
};
