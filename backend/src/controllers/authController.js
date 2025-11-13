const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * 认证控制器
 * 处理认证相关的 HTTP 请求
 */
class AuthController {
  /**
   * 发送注册验证码
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required',
          },
        });
      }

      await authService.sendVerificationCode(email);

      res.status(200).json({
        success: true,
        data: {
          message: 'Verification code sent to your email',
        },
      });
    } catch (error) {
      logger.error('Register error:', error);
      
      if (error.message === 'Email already registered') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 验证验证码并完成注册
   * POST /api/v1/auth/verify
   */
  async verify(req, res, next) {
    try {
      const { email, code, username, password, nickname } = req.body;

      // 验证必填字段
      if (!email || !code || !username || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email, code, username, and password are required',
          },
        });
      }

      const user = await authService.verifyCodeAndRegister(email, code, {
        username,
        password,
        nickname,
      });

      res.status(201).json({
        success: true,
        data: {
          message: 'User registered successfully',
          user,
        },
      });
    } catch (error) {
      logger.error('Verify error:', error);

      if (error.message === 'Invalid or expired verification code') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CODE',
            message: 'Invalid or expired verification code',
          },
        });
      }

      if (error.message === 'Email already registered') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Email already registered',
          },
        });
      }

      if (error.message === 'Username already taken') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USERNAME_EXISTS',
            message: 'Username already taken',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 验证必填字段
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
      }

      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Login error:', error);

      if (error.message === 'Invalid email or password') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      if (error.message.includes('Account is')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: error.message,
          },
        });
      }

      next(error);
    }
  }

  /**
   * 管理员登录
   * POST /api/v1/admin/auth/login
   */
  async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      // 验证必填字段
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
      }

      const result = await authService.login(email, password);

      // 验证用户是否为管理员
      if (result.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied. Admin privileges required.',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Admin login error:', error);

      if (error.message === 'Invalid email or password') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
      }

      if (error.message.includes('Account is')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: error.message,
          },
        });
      }

      next(error);
    }
  }

  /**
   * 刷新访问令牌
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
          },
        });
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Refresh token error:', error);

      if (error.message === 'Invalid or expired refresh token' || error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        });
      }

      if (error.message.includes('Account is')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_DISABLED',
            message: error.message,
          },
        });
      }

      next(error);
    }
  }

  /**
   * 用户登出
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      // req.user 由认证中间件设置
      const userId = req.user.id;

      await authService.logout(userId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  /**
   * 修改密码
   * PUT /api/v1/auth/password
   */
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;

      // 验证必填字段
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Old password and new password are required',
          },
        });
      }

      await authService.changePassword(userId, oldPassword, newPassword);

      res.status(200).json({
        success: true,
        data: {
          message: 'Password changed successfully',
        },
      });
    } catch (error) {
      logger.error('Change password error:', error);

      if (error.message === 'Old password is incorrect') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Old password is incorrect',
          },
        });
      }

      if (error.message.includes('must be at least') || error.message.includes('must contain')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: error.message,
          },
        });
      }

      next(error);
    }
  }
}

module.exports = new AuthController();
