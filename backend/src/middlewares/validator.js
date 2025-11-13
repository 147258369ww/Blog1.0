const { validationResult } = require('express-validator');

/**
 * 验证结果处理中间件
 * 检查 express-validator 的验证结果，如果有错误则返回 400 响应
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: formattedErrors,
      },
    });
  }

  next();
};

module.exports = validate;
