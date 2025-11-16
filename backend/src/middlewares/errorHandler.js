const logger = require('../utils/logger');

/**
 * Error handler middleware
 * Catches all errors and formats them into a consistent response
 */
const errorHandler = (err, req, res, _next) => {
  // Log error
  logger.error(`${err.name}: ${err.message}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: err.stack,
  });

  // Default error values
  let statusCode = 500;
  let message = '服务器内部错误';
  let details = null;

  // Handle operational errors (our custom errors)
  if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
    if (err.details) {
      details = err.details;
    }
  }
  // Handle Sequelize validation errors
  else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = '数据验证失败';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle Sequelize unique constraint errors
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = '数据已存在';
    details = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle Sequelize foreign key constraint errors
  else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = '关联数据不存在';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的令牌';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '令牌已过期';
  }
  // Handle Multer errors (file upload)
  else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = '文件大小超出限制';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = '文件数量超出限制';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = '意外的文件字段';
    } else {
      message = '文件上传失败';
    }
  }
  // Handle programming or unknown errors
  else {
    // In production, don't leak error details
    if (process.env.NODE_ENV === 'production') {
      message = '服务器内部错误';
    } else {
      message = err.message || '服务器内部错误';
    }
  }

  // Send error response
  const response = {
    success: false,
    error: {
      code: err.name || 'INTERNAL_SERVER_ERROR',
      message,
    },
  };

  // Add details if available
  if (details) {
    response.error.details = details;
  }

  // Add stack trace in development (but not in test)
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.error.stack = err.stack;
  }

  // Minimize error payload in production for server errors
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    response.error = { code: 'INTERNAL_SERVER_ERROR' };
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 * Catches all requests that don't match any routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`路由不存在: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
