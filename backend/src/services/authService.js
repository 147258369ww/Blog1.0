const { User } = require('../models');
const emailService = require('./emailService');
const { redisClient } = require('../config/redis');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const logger = require('../utils/logger');

/**
 * 认证服务类
 * 处理用户注册、登录、令牌管理等认证相关业务逻辑
 */
class AuthService {
  /**
   * 发送注册验证码
   * @param {string} email - 用户邮箱
   * @returns {Promise<Object>} 发送结果
   */
  async sendVerificationCode(email) {
    try {
      // 验证邮箱格式（由 User 模型的验证器处理）
      // 检查邮箱是否已存在
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // 生成并发送验证码
      const result = await emailService.generateAndSendVerificationCode(email);
      
      logger.info(`Verification code sent to ${email}`);
      return {
        success: true,
        message: 'Verification code sent successfully',
      };
    } catch (error) {
      logger.error(`Failed to send verification code to ${email}:`, error);
      throw error;
    }
  }

  /**
   * 验证验证码并创建用户
   * @param {string} email - 用户邮箱
   * @param {string} code - 验证码
   * @param {Object} userData - 用户数据 { username, password, nickname }
   * @returns {Promise<Object>} 创建的用户信息
   */
  async verifyCodeAndRegister(email, code, userData) {
    try {
      // 验证验证码
      const isValid = await emailService.verifyCode(email, code);
      if (!isValid) {
        throw new Error('Invalid or expired verification code');
      }

      // 检查邮箱是否已存在（双重检查）
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // 检查用户名是否已存在
      if (userData.username) {
        const existingUsername = await User.findOne({ where: { username: userData.username } });
        if (existingUsername) {
          throw new Error('Username already taken');
        }
      }

      // 创建用户（密码会在 User 模型的 beforeCreate 钩子中自动加密）
      const user = await User.create({
        email,
        username: userData.username,
        password: userData.password,
        nickname: userData.nickname || userData.username,
        email_verified: true, // 验证码验证通过后标记为已验证
      });

      logger.info(`User registered successfully: ${email}`);
      
      // 返回安全的用户信息（不包含密码）
      return user.toSafeJSON();
    } catch (error) {
      logger.error(`Failed to register user ${email}:`, error);
      throw error;
    }
  }

  /**
   * 用户登录
   * @param {string} email - 用户邮箱
   * @param {string} password - 用户密码
   * @returns {Promise<Object>} 包含用户信息和令牌的对象
   */
  async login(email, password) {
    try {
      // 查找用户
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // 验证密码
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // 检查用户状态
      if (user.status !== 'active') {
        throw new Error(`Account is ${user.status}`);
      }

      // 生成令牌
      const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // 将刷新令牌存储到 Redis（7 天有效期）
      const refreshTokenKey = `refresh_token:${user.id}`;
      await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

      // 更新最后登录时间
      await user.update({ last_login_at: new Date() });

      logger.info(`User logged in successfully: ${email}`);

      return {
        user: user.toSafeJSON(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error(`Login failed for ${email}:`, error);
      throw error;
    }
  }

  /**
   * 刷新访问令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<Object>} 新的访问令牌
   */
  async refreshToken(refreshToken) {
    try {
      // 验证刷新令牌
      const decoded = verifyRefreshToken(refreshToken);

      // 检查 Redis 中是否存在该刷新令牌
      const refreshTokenKey = `refresh_token:${decoded.id}`;
      const storedToken = await redisClient.get(refreshTokenKey);

      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid or expired refresh token');
      }

      // 查找用户
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      // 检查用户状态
      if (user.status !== 'active') {
        throw new Error(`Account is ${user.status}`);
      }

      // 生成新的访问令牌
      const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      };

      const newAccessToken = generateAccessToken(tokenPayload);

      logger.info(`Access token refreshed for user: ${user.email}`);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      logger.error('Failed to refresh token:', error);
      throw error;
    }
  }

  /**
   * 用户登出
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} 登出结果
   */
  async logout(userId) {
    try {
      // 从 Redis 中删除刷新令牌
      const refreshTokenKey = `refresh_token:${userId}`;
      await redisClient.del(refreshTokenKey);

      logger.info(`User logged out successfully: ${userId}`);

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      logger.error(`Logout failed for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * 修改密码
   * @param {number} userId - 用户 ID
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   * @returns {Promise<Object>} 修改结果
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      // 查找用户
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 验证旧密码
      const isOldPasswordValid = await user.validatePassword(oldPassword);
      if (!isOldPasswordValid) {
        throw new Error('Old password is incorrect');
      }

      // 验证新密码强度（至少 8 个字符，包含字母和数字）
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      const hasLetter = /[a-zA-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);

      if (!hasLetter || !hasNumber) {
        throw new Error('New password must contain both letters and numbers');
      }

      // 更新密码（会在 User 模型的 beforeUpdate 钩子中自动加密）
      await user.update({ password: newPassword });

      // 使所有刷新令牌失效
      const refreshTokenKey = `refresh_token:${userId}`;
      await redisClient.del(refreshTokenKey);

      logger.info(`Password changed successfully for user: ${userId}`);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      logger.error(`Failed to change password for user ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = new AuthService();
