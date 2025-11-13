const { sequelize, Post, User, Category } = require('../index');

describe('Post Model', () => {
  let testUser;
  let testCategory;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    testUser = await User.create({
      username: 'testauthor',
      email: 'author@example.com',
      password: 'password123',
    });

    testCategory = await Category.create({
      name: 'Technology',
      slug: 'technology',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Post.destroy({ where: {}, force: true });
  });

  describe('Model Validation', () => {
    test('should create a valid post', async () => {
      const postData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'This is test content',
        author_id: testUser.id,
        category_id: testCategory.id,
      };

      const post = await Post.create(postData);
      
      expect(post.id).toBeDefined();
      expect(post.title).toBe(postData.title);
      expect(post.slug).toBe(postData.slug);
      expect(post.content).toBe(postData.content);
      expect(post.status).toBe('draft');
      expect(post.is_featured).toBe(false);
      expect(post.allow_comments).toBe(true);
      expect(post.view_count).toBe(0);
    });

    test('should fail without required fields', async () => {
      await expect(Post.create({})).rejects.toThrow();
    });

    test('should fail with duplicate slug', async () => {
      const postData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'This is test content',
        author_id: testUser.id,
      };

      await Post.create(postData);
      
      await expect(
        Post.create({ ...postData, title: 'Another Post' })
      ).rejects.toThrow();
    });

    test('should fail with empty title', async () => {
      const postData = {
        title: '',
        slug: 'test-post',
        content: 'This is test content',
        author_id: testUser.id,
      };

      await expect(Post.create(postData)).rejects.toThrow();
    });

    test('should fail with title longer than 200 characters', async () => {
      const postData = {
        title: 'a'.repeat(201),
        slug: 'test-post',
        content: 'This is test content',
        author_id: testUser.id,
      };

      await expect(Post.create(postData)).rejects.toThrow();
    });
  });

  describe('Soft Delete (Paranoid)', () => {
    test('should soft delete post', async () => {
      const post = await Post.create({
        title: 'Test Post',
        slug: 'test-post',
        content: 'This is test content',
        author_id: testUser.id,
      });

      await post.destroy();
      
      const foundPost = await Post.findByPk(post.id);
      expect(foundPost).toBeNull();
      
      const deletedPost = await Post.findByPk(post.id, { paranoid: false });
      expect(deletedPost).not.toBeNull();
      expect(deletedPost.deleted_at).not.toBeNull();
    });

    test('should restore soft deleted post', async () => {
      const post = await Post.create({
        title: 'Test Post',
        slug: 'test-post',
        content: 'This is test content',
        author_id: testUser.id,
      });

      await post.destroy();
      await post.restore();
      
      const restoredPost = await Post.findByPk(post.id);
      expect(restoredPost).not.toBeNull();
      expect(restoredPost.deleted_at).toBeNull();
    });
  });

  describe('Status Field', () => {
    test('should accept valid status values', async () => {
      const statuses = ['draft', 'published', 'archived'];
      
      for (const status of statuses) {
        const post = await Post.create({
          title: `Test Post ${status}`,
          slug: `test-post-${status}`,
          content: 'This is test content',
          author_id: testUser.id,
          status,
        });
        
        expect(post.status).toBe(status);
      }
    });
  });
});
