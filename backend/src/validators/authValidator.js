const { body } = require('express-validator');

/**
 * 认证相关的验证规则
 */

/**
 * 注册验证码发送验证
 */
const registerValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

/**
 * 验证码验证和注册验证
 */
const verifyValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must contain only numbers'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  body('nickname')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Nickname must be between 1 and 50 characters'),
];

/**
 * 登录验证
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * 刷新令牌验证
 */
const refreshTokenValidation = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),
];

/**
 * 修改密码验证
 */
const changePasswordValidation = [
  body('oldPassword')
    .trim()
    .notEmpty()
    .withMessage('Old password is required'),
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('New password must be different from old password');
      }
      return true;
    }),
];

module.exports = {
  registerValidation,
  verifyValidation,
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
};
