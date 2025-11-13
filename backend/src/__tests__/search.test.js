const request = require('supertest');
const app = require('../app');
const { sequelize, Post, User, Category, Tag } = require('../models');

describe('Search Functionality', () => {
  let testUser;
  let testCategory;
  let testTags;
  let testPosts;

  beforeAll(async () => {
    // 同步数据库
    await sequelize.sync({ force: true });

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
      { name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
      { name: 'Node.js', slug: 'nodejs', color: '#339933' },
      { name: 'React', slug: 'react', color: '#61DAFB' },
    ]);

    // 创建测试文章
    testPosts = await Post.bulkCreate([
      {
        title: 'Introduction to JavaScript',
        slug: 'intro-to-javascript',
        summary: 'Learn JavaScript basics',
        content: 'JavaScript is a programming language used for web development.',
        author_id: testUser.id,
        category_id: testCategory.id,
        status: 'published',
        published_at: new Date(),
      },
      {
        title: 'Node.js Best Practices',
        slug: 'nodejs-best-practices',
        summary: 'Best practices for Node.js',
        content: 'Node.js is a JavaScript runtime built on Chrome V8 engine.',
        author_id: testUser.id,
        category_id: testCategory.id,
        status: 'published',
        published_at: new Date(),
      },
      {
        title: 'React Hooks Guide',
        slug: 'react-hooks-guide',
        summary: 'Complete guide to React Hooks',
        content: 'React Hooks allow you to use state and other React features.',
        author_id: testUser.id,
        category_id: testCategory.id,
        status: 'published',
        published_at: new Date(),
      },
      {
        title: 'Draft Article',
        slug: 'draft-article',
        summary: 'This is a draft',
        content: 'This article contains JavaScript content but is not published.',
        author_id: testUser.id,
        category_id: testCategory.id,
        status: 'draft',
      },
    ]);

    // 关联标签
    await testPosts[0].setTags([testTags[0]]);
    await testPosts[1].setTags([testTags[1]]);
    await testPosts[2].setTags([testTags[2]]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST Search - GET /api/v1/posts/search', () => {
    it('应该返回包含关键词的文章', async () => {
      const response = await request(app)
        .get('/api/v1/posts/search')
        .query({ keyword: 'JavaScript' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('pagination');
    });

    it('应该只返回已发布的文章', async () => {
      const response = await request(app)
        .get('/api/v1/posts/search')
        .query({ keyword: 'JavaScript' });

      expect(response.status).toBe(200);
      const draftArticle = response.body.data.find(post => post.status === 'draft');
      expect(draftArticle).toBeUndefined();
    });

    it('应该支持分页', async () => {
      const response = await request(app)
        .get('/api/v1/posts/search')
        .query({ keyword: 'JavaScript', page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('应该在没有关键词时返回400错误', async () => {
      const response = await request(app)
        .get('/api/v1/posts/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_KEYWORD');
    });

    it('应该在没有匹配结果时返回空数组', async () => {
      const response = await request(app)
        .get('/api/v1/posts/search')
        .query({ keyword: 'nonexistentkeyword12345' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('Tag Search - GET /api/v1/tags/search', () => {
    it('应该返回匹配的标签', async () => {
      const response = await request(app)
        .get('/api/v1/tags/search')
        .query({ keyword: 'Java' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const hasJavaScriptTag = response.body.data.some(tag => tag.name === 'JavaScript');
      expect(hasJavaScriptTag).toBe(true);
    });

    it('应该支持部分匹配', async () => {
      const response = await request(app)
        .get('/api/v1/tags/search')
        .query({ keyword: 'node' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const hasNodeTag = response.body.data.some(tag => tag.name.toLowerCase().includes('node'));
      expect(hasNodeTag).toBe(true);
    });

    it('应该在没有关键词时返回400错误', async () => {
      const response = await request(app)
        .get('/api/v1/tags/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_KEYWORD');
    });

    it('应该在没有匹配结果时返回空数组', async () => {
      const response = await request(app)
        .get('/api/v1/tags/search')
        .query({ keyword: 'nonexistenttag12345' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });
});
