const request = require('supertest');
const express = require('express');
const { sequelize, User } = require('../../models');
const { redisClient } = require('../../config/redis');
const authRoutes = require('../v1/auth');
const emailService = require('../../services/emailService');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

// Mock emailService
jest.mock('../../services/emailService');

describe('Auth Routes Integration Tests', () => {
  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });
    
    // 确保 Redis 连接
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  });

  afterAll(async () => {
    // 清理数据库
    await sequelize.close();
    
    // 关闭 Redis 连接
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  });

  beforeEach(async () => {
    // 清空数据库
    await User.destroy({ where: {}, force: true });
    
    // 清空 Redis
    await redisClient.flushDb();
    
    // 重置 mocks
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should send verification code for valid email', async () => {
      const email = 'test@example.com';
      
      emailService.generateAndSendVerificationCode.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('Verification code sent');
      expect(emailService.generateAndSendVerificationCode).toHaveBeenCalledWith(email);
    });

    it('should return error if email is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return error if email already exists', async () => {
      const email = 'existing@example.com';
      
      // 创建已存在的用户
      await User.create({
        username: 'existinguser',
        email,
        password: 'password123',
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('POST /api/v1/auth/verify', () => {
    it('should register user with valid verification code', async () => {
      const email = 'newuser@example.com';
      const code = '123456';
      const username = 'newuser';
      const password = 'password123';

      // Mock 验证码验证
      emailService.verifyCode.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ email, code, username, password })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(email);
      expect(response.body.data.user.username).toBe(username);
      expect(response.body.data.user.password).toBeUndefined(); // 密码不应返回

      // 验证用户已创建
      const user = await User.findOne({ where: { email } });
      expect(user).not.toBeNull();
      expect(user.email_verified).toBe(true);
    });

    it('should return error if verification code is invalid', async () => {
      const email = 'test@example.com';
      const code = '999999';

      emailService.verifyCode.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({
          email,
          code,
          username: 'testuser',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CODE');
    });

    it('should return error if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // 创建测试用户
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        status: 'active',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // 验证刷新令牌已存储到 Redis
      const user = await User.findOne({ where: { email: 'test@example.com' } });
      const storedToken = await redisClient.get(`refresh_token:${user.id}`);
      expect(storedToken).toBe(response.body.data.refreshToken);
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return error if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let user;
    let refreshToken;

    beforeEach(async () => {
      // 创建测试用户并登录
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        status: 'active',
      });

      // 登录获取令牌
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    it('should return error if refresh token is missing', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken;
    let user;

    beforeEach(async () => {
      // 创建测试用户并登录
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        status: 'active',
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('Logged out');

      // 验证刷新令牌已从 Redis 删除
      const storedToken = await redisClient.get(`refresh_token:${user.id}`);
      expect(storedToken).toBeNull();
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/auth/password', () => {
    let accessToken;
    let user;

    beforeEach(async () => {
      // 创建测试用户并登录
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'oldPassword123',
        status: 'active',
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'oldPassword123',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should change password successfully', async () => {
      // 获取修改密码前的刷新令牌
      const oldRefreshToken = await redisClient.get(`refresh_token:${user.id}`);
      expect(oldRefreshToken).not.toBeNull();

      const response = await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'oldPassword123',
          newPassword: 'newPassword456',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('Password changed');

      // 验证旧的刷新令牌已失效（被删除）
      const storedTokenAfterChange = await redisClient.get(`refresh_token:${user.id}`);
      expect(storedTokenAfterChange).toBeNull();

      // 验证可以用新密码登录
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newPassword456',
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      
      // 验证新登录后会生成新的刷新令牌
      const newRefreshToken = await redisClient.get(`refresh_token:${user.id}`);
      expect(newRefreshToken).not.toBeNull();
      expect(newRefreshToken).not.toBe(oldRefreshToken);
    });

    it('should return error for incorrect old password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'wrongPassword',
          newPassword: 'newPassword456',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PASSWORD');
    });

    it('should return error for weak new password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'oldPassword123',
          newPassword: 'weak',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('WEAK_PASSWORD');
    });

    it('should return error for password without numbers', async () => {
      const response = await request(app)
        .put('/api/v1/auth/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'oldPassword123',
          newPassword: 'passwordonly',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('WEAK_PASSWORD');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/auth/password')
        .send({
          oldPassword: 'oldPassword123',
          newPassword: 'newPassword456',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
