const request = require('supertest');
const app = require('../app');
const { sequelize, Link, User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config');

describe('Link Management', () => {
  let adminUser;
  let adminToken;
  let testLinks;

  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });

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

    // 创建测试友链
    testLinks = await Link.bulkCreate([
      {
        name: 'Google',
        url: 'https://www.google.com',
        logo: 'https://www.google.com/favicon.ico',
        description: 'Search engine',
        sort_order: 1,
        status: 'active',
      },
      {
        name: 'GitHub',
        url: 'https://github.com',
        logo: 'https://github.com/favicon.ico',
        description: 'Code hosting platform',
        sort_order: 2,
        status: 'active',
      },
      {
        name: 'Inactive Link',
        url: 'https://example.com',
        description: 'Inactive link',
        sort_order: 3,
        status: 'inactive',
      },
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Public Link API', () => {
    describe('GET /api/v1/links', () => {
      it('应该返回活跃的友链列表', async () => {
        const response = await request(app)
          .get('/api/v1/links');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(2); // 只有2个活跃友链
        expect(response.body).toHaveProperty('pagination');
      });

      it('应该只返回状态为 active 的友链', async () => {
        const response = await request(app)
          .get('/api/v1/links');

        expect(response.status).toBe(200);
        const inactiveLink = response.body.data.find(link => link.status === 'inactive');
        expect(inactiveLink).toBeUndefined();
      });

      it('应该按 sort_order 升序排序', async () => {
        const response = await request(app)
          .get('/api/v1/links');

        expect(response.status).toBe(200);
        const links = response.body.data;
        for (let i = 0; i < links.length - 1; i++) {
          expect(links[i].sort_order).toBeLessThanOrEqual(links[i + 1].sort_order);
        }
      });

      it('应该支持分页', async () => {
        const response = await request(app)
          .get('/api/v1/links')
          .query({ page: 1, limit: 1 });

        expect(response.status).toBe(200);
        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(1);
        expect(response.body.data.length).toBe(1);
      });
    });
  });

  describe('Admin Link API', () => {
    describe('GET /api/v1/admin/links', () => {
      it('应该返回所有友链（包括不活跃的）', async () => {
        const response = await request(app)
          .get('/api/v1/admin/links')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.length).toBe(3); // 包括不活跃的友链
      });

      it('应该支持按状态筛选', async () => {
        const response = await request(app)
          .get('/api/v1/admin/links')
          .query({ status: 'inactive' })
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].status).toBe('inactive');
      });

      it('应该在没有认证时返回401错误', async () => {
        const response = await request(app)
          .get('/api/v1/admin/links');

        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/v1/admin/links', () => {
      it('应该成功创建友链', async () => {
        const newLink = {
          name: 'Stack Overflow',
          url: 'https://stackoverflow.com',
          logo: 'https://stackoverflow.com/favicon.ico',
          description: 'Q&A platform for developers',
          sort_order: 4,
          status: 'active',
        };

        const response = await request(app)
          .post('/api/v1/admin/links')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(newLink);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.name).toBe(newLink.name);
        expect(response.body.data.url).toBe(newLink.url);
      });

      it('应该验证 URL 格式', async () => {
        const invalidLink = {
          name: 'Invalid Link',
          url: 'not-a-valid-url',
          description: 'Invalid URL',
        };

        const response = await request(app)
          .post('/api/v1/admin/links')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidLink);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_URL');
      });

      it('应该验证 logo URL 格式', async () => {
        const invalidLink = {
          name: 'Invalid Logo',
          url: 'https://example.com',
          logo: 'invalid-logo-url',
          description: 'Invalid logo URL',
        };

        const response = await request(app)
          .post('/api/v1/admin/links')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidLink);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_URL');
      });

      it('应该在没有认证时返回401错误', async () => {
        const newLink = {
          name: 'Test Link',
          url: 'https://test.com',
        };

        const response = await request(app)
          .post('/api/v1/admin/links')
          .send(newLink);

        expect(response.status).toBe(401);
      });
    });

    describe('PUT /api/v1/admin/links/:id', () => {
      it('应该成功更新友链', async () => {
        const updateData = {
          name: 'Google Updated',
          description: 'Updated description',
        };

        const response = await request(app)
          .put(`/api/v1/admin/links/${testLinks[0].id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(updateData.name);
        expect(response.body.data.description).toBe(updateData.description);
      });

      it('应该验证更新的 URL 格式', async () => {
        const updateData = {
          url: 'invalid-url',
        };

        const response = await request(app)
          .put(`/api/v1/admin/links/${testLinks[0].id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_URL');
      });

      it('应该在友链不存在时返回404错误', async () => {
        const response = await request(app)
          .put('/api/v1/admin/links/99999')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ name: 'Test' });

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('LINK_NOT_FOUND');
      });

      it('应该在没有认证时返回401错误', async () => {
        const response = await request(app)
          .put(`/api/v1/admin/links/${testLinks[0].id}`)
          .send({ name: 'Test' });

        expect(response.status).toBe(401);
      });
    });

    describe('DELETE /api/v1/admin/links/:id', () => {
      it('应该成功删除友链', async () => {
        const response = await request(app)
          .delete(`/api/v1/admin/links/${testLinks[2].id}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('友链已删除');

        // 验证友链已被删除
        const deletedLink = await Link.findByPk(testLinks[2].id);
        expect(deletedLink).toBeNull();
      });

      it('应该在友链不存在时返回404错误', async () => {
        const response = await request(app)
          .delete('/api/v1/admin/links/99999')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('LINK_NOT_FOUND');
      });

      it('应该在没有认证时返回401错误', async () => {
        const response = await request(app)
          .delete(`/api/v1/admin/links/${testLinks[0].id}`);

        expect(response.status).toBe(401);
      });
    });
  });
});
