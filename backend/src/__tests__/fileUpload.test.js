const request = require('supertest');
const path = require('path');
const fs = require('fs').promises;
const app = require('../app');
const { sequelize, File, User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config');

describe('File Upload', () => {
  let adminToken;
  let adminUser;
  let testFilePath;

  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });

    // 创建管理员用户
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password: '$2b$10$abcdefghijklmnopqrstuv', // 预加密密码
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

    // 创建测试文件
    testFilePath = path.join(process.cwd(), 'test-image.png');
    await fs.writeFile(testFilePath, Buffer.from('fake image content'));
  });

  afterAll(async () => {
    // 清理测试文件
    try {
      await fs.unlink(testFilePath);
    } catch (error) {
      // 忽略文件不存在的错误
    }

    // 清理上传的文件
    const files = await File.findAll();
    for (const file of files) {
      try {
        await fs.unlink(file.path);
      } catch (error) {
        // 忽略文件不存在的错误
      }
    }

    await sequelize.close();
  });

  describe('POST /api/v1/admin/files/upload', () => {
    it('应该成功上传文件', async () => {
      const response = await request(app)
        .post('/api/v1/admin/files/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', testFilePath);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('filename');
      expect(response.body.data).toHaveProperty('url');
    });

    it('应该拒绝未认证的上传请求', async () => {
      // 注意：使用 .send({}) 而不是 .attach() 来避免 supertest 和 multer 的连接问题
      // 在实际生产环境中，认证中间件会在 multer 之前正确拦截请求
      const response = await request(app)
        .post('/api/v1/admin/files/upload')
        .send({});

      expect(response.status).toBe(401);
    });

    it('应该拒绝没有文件的请求', async () => {
      const response = await request(app)
        .post('/api/v1/admin/files/upload')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/files', () => {
    it('应该返回文件列表', async () => {
      const response = await request(app)
        .get('/api/v1/admin/files')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('DELETE /api/v1/admin/files/:id', () => {
    it('应该成功删除文件', async () => {
      // 先上传一个文件
      const uploadResponse = await request(app)
        .post('/api/v1/admin/files/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', testFilePath);

      const fileId = uploadResponse.body.data.id;

      // 删除文件
      const deleteResponse = await request(app)
        .delete(`/api/v1/admin/files/${fileId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });

    it('应该返回404当文件不存在', async () => {
      const response = await request(app)
        .delete('/api/v1/admin/files/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
