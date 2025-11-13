const request = require('supertest');
const app = require('../app');
const { sequelize, Post, Tag, User, Category } = require('../models');
const { redisClient } = require('../config/redis');

describe('Statistics', () => {
  let testUser;
  let testCategory;
  let testPosts;
  let testTags;

  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });

    // 连接 Redis
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // 创建测试用户
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: '$2b$10$abcdefghijklmnopqrstuv',
      role: 'admin',
      status: 'active',
      email_verified: true,
    });

    // 创建测试分类
    testCategory = await Category.create({
      name: 'Technology',
      slug: 'technology',
      description: 'Tech articles',
    });

    // 创建测试标签
    testTags = await Tag.bulkCreate([
      { name: 'JavaScript', slug: 'javascript', color: '#f7df1e' },
      { name: 'Node.js', slug: 'nodejs', color: '#339933' },
      { name: 'React', slug: 'react', color: '#61dafb' },
    ]);

    // 创建测试文章
    testPosts = await Post.bulkCreate([
      {
        title: 'Published Post 1',
        slug: 'published-post-1',
        content: 'Content 1',
        author_id: testUser.id,
        category_id: testCategory.id,
        status: 'published',
        view_count: 100,
        published_at: new Date(),
      },
      {
        title: 'Published Post 2',
        slug: 'published-post-2',
        content: 'Content 2',
        author_id: testUser.id,
        category_id: testCategory.id,
        status: 'published',
        view_count: 50,
        published_at: new Date(),
      },
      {
        title: 'Draft Post',
        slug: 'draft-post',
        content: 'Draft content',
        author_id: testUser.id,
        category_id: testCategory.id,
        status: 'draft',
        view_count: 0,
      },
      {
        title: 'Archived Post',
        slug: 'archived-post',
        content: 'Archived content',
        author_id: testUser.id,
        category_id: testCategory.id,
        status: 'archived',
        view_count: 25,
        published_at: new Date(),
      },
    ]);

    // 在 Redis 中添加一些浏览量缓存
    await redisClient.set('post_views:1', '10');
    await redisClient.set('post_views:2', '5');
  });

  afterAll(async () => {
    // 清理 Redis 测试数据
    await redisClient.del('post_views:1');
    await redisClient.del('post_views:2');
    
    // 关闭连接
    await redisClient.quit();
    await sequelize.close();
  });

  describe('GET /api/v1/stats', () => {
    it('应该返回博客统计数据', async () => {
      const response = await request(app)
        .get('/api/v1/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPosts');
      expect(response.body.data).toHaveProperty('totalTags');
      expect(response.body.data).toHaveProperty('totalViews');
    });

    it('应该只统计已发布的文章数量', async () => {
      const response = await request(app)
        .get('/api/v1/stats');

      expect(response.status).toBe(200);
      expect(response.body.data.totalPosts).toBe(2); // 只有2篇已发布的文章
    });

    it('应该返回正确的标签总数', async () => {
      const response = await request(app)
        .get('/api/v1/stats');

      expect(response.status).toBe(200);
      expect(response.body.data.totalTags).toBe(3);
    });

    it('应该聚合数据库和 Redis 中的浏览量', async () => {
      const response = await request(app)
        .get('/api/v1/stats');

      expect(response.status).toBe(200);
      // 数据库中已发布文章的浏览量: 100 + 50 = 150
      // Redis 中的浏览量: 10 + 5 = 15
      // 总计: 165
      expect(response.body.data.totalViews).toBe(165);
    });
  });

  describe('GET /api/v1/stats/posts', () => {
    it('应该返回按状态分组的文章统计', async () => {
      const response = await request(app)
        .get('/api/v1/stats/posts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('draft');
      expect(response.body.data).toHaveProperty('published');
      expect(response.body.data).toHaveProperty('archived');
    });

    it('应该返回正确的文章数量统计', async () => {
      const response = await request(app)
        .get('/api/v1/stats/posts');

      expect(response.status).toBe(200);
      expect(response.body.data.draft).toBe(1);
      expect(response.body.data.published).toBe(2);
      expect(response.body.data.archived).toBe(1);
    });
  });
});
