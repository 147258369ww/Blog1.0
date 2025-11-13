const { sequelize, User, Post, Category, Tag, File } = require('../index');

describe('Model Associations', () => {
  let testUser;
  let testCategory;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
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

  describe('User-Post Association', () => {
    test('should associate user with posts', async () => {
      const post1 = await Post.create({
        title: 'Post 1',
        slug: 'post-1',
        content: 'Content 1',
        author_id: testUser.id,
      });

      const post2 = await Post.create({
        title: 'Post 2',
        slug: 'post-2',
        content: 'Content 2',
        author_id: testUser.id,
      });

      const userWithPosts = await User.findByPk(testUser.id, {
        include: [{ model: Post, as: 'posts' }],
      });

      expect(userWithPosts.posts).toHaveLength(2);
      expect(userWithPosts.posts[0].author_id).toBe(testUser.id);
    });

    test('should get post with author', async () => {
      const post = await Post.create({
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        author_id: testUser.id,
      });

      const postWithAuthor = await Post.findByPk(post.id, {
        include: [{ model: User, as: 'author' }],
      });

      expect(postWithAuthor.author.id).toBe(testUser.id);
      expect(postWithAuthor.author.username).toBe('testuser');
    });
  });

  describe('Category-Post Association', () => {
    test('should associate category with posts', async () => {
      await Post.create({
        title: 'Post 1',
        slug: 'cat-post-1',
        content: 'Content 1',
        author_id: testUser.id,
        category_id: testCategory.id,
      });

      const categoryWithPosts = await Category.findByPk(testCategory.id, {
        include: [{ model: Post, as: 'posts' }],
      });

      expect(categoryWithPosts.posts).toHaveLength(1);
      expect(categoryWithPosts.posts[0].category_id).toBe(testCategory.id);
    });

    test('should get post with category', async () => {
      const post = await Post.create({
        title: 'Test Post',
        slug: 'test-cat-post',
        content: 'Test content',
        author_id: testUser.id,
        category_id: testCategory.id,
      });

      const postWithCategory = await Post.findByPk(post.id, {
        include: [{ model: Category, as: 'category' }],
      });

      expect(postWithCategory.category.id).toBe(testCategory.id);
      expect(postWithCategory.category.name).toBe('Technology');
    });
  });

  describe('Post-Tag Association (Many-to-Many)', () => {
    test('should associate post with multiple tags', async () => {
      const post = await Post.create({
        title: 'Test Post',
        slug: 'test-tag-post',
        content: 'Test content',
        author_id: testUser.id,
      });

      const tag1 = await Tag.create({
        name: 'JavaScript',
        slug: 'javascript',
      });

      const tag2 = await Tag.create({
        name: 'Node.js',
        slug: 'nodejs',
      });

      await post.addTags([tag1, tag2]);

      const postWithTags = await Post.findByPk(post.id, {
        include: [{ model: Tag, as: 'tags' }],
      });

      expect(postWithTags.tags).toHaveLength(2);
      expect(postWithTags.tags.map(t => t.name)).toContain('JavaScript');
      expect(postWithTags.tags.map(t => t.name)).toContain('Node.js');
    });

    test('should associate tag with multiple posts', async () => {
      const tag = await Tag.create({
        name: 'React',
        slug: 'react',
      });

      const post1 = await Post.create({
        title: 'Post 1',
        slug: 'react-post-1',
        content: 'Content 1',
        author_id: testUser.id,
      });

      const post2 = await Post.create({
        title: 'Post 2',
        slug: 'react-post-2',
        content: 'Content 2',
        author_id: testUser.id,
      });

      await tag.addPosts([post1, post2]);

      const tagWithPosts = await Tag.findByPk(tag.id, {
        include: [{ model: Post, as: 'posts' }],
      });

      expect(tagWithPosts.posts).toHaveLength(2);
    });
  });

  describe('User-File Association', () => {
    test('should associate user with files', async () => {
      const file = await File.create({
        filename: 'test.jpg',
        original_name: 'test.jpg',
        mime_type: 'image/jpeg',
        size: 1024,
        path: '/uploads/test.jpg',
        url: 'http://example.com/uploads/test.jpg',
        file_type: 'image',
        uploader_id: testUser.id,
      });

      const userWithFiles = await User.findByPk(testUser.id, {
        include: [{ model: File, as: 'files' }],
      });

      expect(userWithFiles.files).toHaveLength(1);
      expect(userWithFiles.files[0].uploader_id).toBe(testUser.id);
    });

    test('should get file with uploader', async () => {
      const file = await File.create({
        filename: 'test2.jpg',
        original_name: 'test2.jpg',
        mime_type: 'image/jpeg',
        size: 2048,
        path: '/uploads/test2.jpg',
        url: 'http://example.com/uploads/test2.jpg',
        file_type: 'image',
        uploader_id: testUser.id,
      });

      const fileWithUploader = await File.findByPk(file.id, {
        include: [{ model: User, as: 'uploader' }],
      });

      expect(fileWithUploader.uploader.id).toBe(testUser.id);
      expect(fileWithUploader.uploader.username).toBe('testuser');
    });
  });
});
