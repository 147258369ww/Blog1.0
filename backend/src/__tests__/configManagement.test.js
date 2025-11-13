const request = require('supertest');
const app = require('../app');
const { sequelize, Config, User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { redisClient } = require('../config/redis');

describe('Config Management', () => {
  let adminUser;
  let adminToken;
  let testConfigs;

  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });

    // 连接 Redis
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // 创建管理员用户
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuv',
      role: 'admin',
      status: 'active',
      email_verified: true,
    });

    // 生成管理员 token
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      config.jwt.secret,
      { expiresIn: config.jwt.accessTokenExpiry }
    );

    // 创建测试配置
    testConfigs = await Config.bulkCreate([
      {
        key: 'site_name',
        value: 'My Blog',
        type: 'string',
        description: 'Website name',
        is_public: true,
      },
      {
        key: 'posts_per_page',
        value: '10',
        type: 'number',
        description: 'Number of posts per page',
        is_public: true,
      },
      {
        key: 'enable_comments',
        value: 'true',
        type: 'boolean',
        description: 'Enable comments',
        is_public: false,
      },
      {
        key: 'social_links',
        value: JSON.stringify({ twitter: 'https://twitter.com', github: 'https://github.com' }),
        type: 'json',
        description: 'Social media links',
        is_public: true,
      },
    ]);
  });

  afterAll(async () => {
    // 清理 Redis
    await redisClient.flushDb();
    await redisClient.quit();
    await sequelize.close();
  });

  afterEach(async () => {
    // 每个测试后清理 Redis 缓存
    await redisClient.flushDb();
  });

  describe('Admin Config API', () => {
    describe('GET /api/v1/admin/config', () => {
      it('应该返回所有配置', async () => {
        const response = await request(app)
          .get('/api/v1/admin/config')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(4);
      });

      it('应该解析不同类型的配置值', async () => {
        const response = await request(app)
          .get('/api/v1/admin/config')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        
        const siteNameConfig = response.body.data.find(c => c.key === 'site_name');
        expect(siteNameConfig.value).toBe('My Blog');
        expect(typeof siteNameConfig.value).toBe('string');

        const postsPerPageConfig = response.body.data.find(c => c.key === 'posts_per_page');
        expect(postsPerPageConfig.value).toBe(10);
        expect(typeof postsPerPageConfig.value).toBe('number');

        const enableCommentsConfig = response.body.data.find(c => c.key === 'enable_comments');
        expect(enableCommentsConfig.value).toBe(true);
        expect(typeof enableCommentsConfig.value).toBe('boolean');

        const socialLinksConfig = response.body.data.find(c => c.key === 'social_links');
        expect(typeof socialLinksConfig.value).toBe('object');
        expect(socialLinksConfig.value).toHaveProperty('twitter');
      });

      it('应该在没有认证时返回401错误', async () => {
        const response = await request(app)
          .get('/api/v1/admin/config');

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/v1/admin/config/:key', () => {
      it('应该返回指定的配置', async () => {
        const response = await request(app)
          .get('/api/v1/admin/config/site_name')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.key).toBe('site_name');
        expect(response.body.data.value).toBe('My Blog');
      });

      it('应该在配置不存在时返回404错误', async () => {
        const response = await request(app)
          .get('/api/v1/admin/config/non_existent_key')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('CONFIG_NOT_FOUND');
      });
    });

    describe('PUT /api/v1/admin/config', () => {
      it('应该成功更新单个配置', async () => {
        const updateData = {
          key: 'site_name',
          value: 'Updated Blog Name',
        };

        const response = await request(app)
          .put('/api/v1/admin/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.key).toBe('site_name');
        expect(response.body.data.value).toBe('Updated Blog Name');

        // 验证数据库已更新
        const updatedConfig = await Config.findOne({ where: { key: 'site_name' } });
        expect(updatedConfig.value).toBe('Updated Blog Name');
      });

      it('应该成功批量更新配置', async () => {
        const updateData = [
          { key: 'site_name', value: 'Batch Updated Name' },
          { key: 'posts_per_page', value: 20, type: 'number' },
        ];

        const response = await request(app)
          .put('/api/v1/admin/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2);
        expect(response.body.message).toContain('2 configurations');
      });

      it('应该创建不存在的配置', async () => {
        const newConfig = {
          key: 'new_config',
          value: 'New Value',
          type: 'string',
          description: 'A new configuration',
          is_public: false,
        };

        const response = await request(app)
          .put('/api/v1/admin/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newConfig);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.key).toBe('new_config');

        // 验证配置已创建
        const createdConfig = await Config.findOne({ where: { key: 'new_config' } });
        expect(createdConfig).not.toBeNull();
      });

      it('应该在缺少 key 时返回400错误', async () => {
        const invalidData = {
          value: 'Some value',
        };

        const response = await request(app)
          .put('/api/v1/admin/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('MISSING_KEY');
      });

      it('应该在没有认证时返回401错误', async () => {
        const updateData = {
          key: 'site_name',
          value: 'Test',
        };

        const response = await request(app)
          .put('/api/v1/admin/config')
          .send(updateData);

        expect(response.status).toBe(401);
      });
    });

    describe('DELETE /api/v1/admin/config/:key', () => {
      it('应该成功删除配置', async () => {
        const response = await request(app)
          .delete('/api/v1/admin/config/enable_comments')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('配置已删除');

        // 验证配置已被删除
        const deletedConfig = await Config.findOne({ where: { key: 'enable_comments' } });
        expect(deletedConfig).toBeNull();
      });

      it('应该在配置不存在时返回404错误', async () => {
        const response = await request(app)
          .delete('/api/v1/admin/config/non_existent_key')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('CONFIG_NOT_FOUND');
      });

      it('应该在没有认证时返回401错误', async () => {
        const response = await request(app)
          .delete('/api/v1/admin/config/site_name');

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Cache Mechanism', () => {
    it('应该在首次读取后缓存配置', async () => {
      // 清除缓存确保测试隔离
      await redisClient.flushDb();

      // 第一次请求
      const response1 = await request(app)
        .get('/api/v1/admin/config/social_links')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response1.status).toBe(200);

      // 检查 Redis 缓存
      const cachedValue = await redisClient.get('config:social_links');
      expect(cachedValue).not.toBeNull();

      const parsedCache = JSON.parse(cachedValue);
      expect(parsedCache.key).toBe('social_links');
      expect(parsedCache.value).toHaveProperty('twitter');
    });

    it('应该在更新配置后清除缓存', async () => {
      // 先读取配置以创建缓存
      await request(app)
        .get('/api/v1/admin/config/site_name')
        .set('Authorization', `Bearer ${adminToken}`);

      // 验证缓存存在
      let cachedValue = await redisClient.get('config:site_name');
      expect(cachedValue).not.toBeNull();

      // 更新配置
      await request(app)
        .put('/api/v1/admin/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ key: 'site_name', value: 'New Name' });

      // 验证缓存已清除
      cachedValue = await redisClient.get('config:site_name');
      expect(cachedValue).toBeNull();
    });

    it('应该在删除配置后清除缓存', async () => {
      // 先读取配置以创建缓存
      await request(app)
        .get('/api/v1/admin/config/posts_per_page')
        .set('Authorization', `Bearer ${adminToken}`);

      // 验证缓存存在
      let cachedValue = await redisClient.get('config:posts_per_page');
      expect(cachedValue).not.toBeNull();

      // 删除配置
      await request(app)
        .delete('/api/v1/admin/config/posts_per_page')
        .set('Authorization', `Bearer ${adminToken}`);

      // 验证缓存已清除
      cachedValue = await redisClient.get('config:posts_per_page');
      expect(cachedValue).toBeNull();
    });
  });
});
