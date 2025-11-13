const postService = require('../postService');
const postRepository = require('../../repositories/postRepository');
const { Category, Tag } = require('../../models');
const { redisClient } = require('../../config/redis');

// Mock dependencies
jest.mock('../../repositories/postRepository');
jest.mock('../../models', () => ({
  Category: {
    findByPk: jest.fn(),
  },
  Tag: {
    findAll: jest.fn(),
  },
}));
jest.mock('../../config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    setEx: jest.fn(),
    incr: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  },
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('PostService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const postData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        category_id: 1,
        tag_ids: [1, 2],
        status: 'published',
      };
      const authorId = 1;
      const mockPost = { id: 1, ...postData };

      postRepository.findBySlug.mockResolvedValue(null);
      Category.findByPk.mockResolvedValue({ id: 1 });
      Tag.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      postRepository.create.mockResolvedValue(mockPost);
      postRepository.setTags.mockResolvedValue(true);
      postRepository.findById.mockResolvedValue(mockPost);

      const result = await postService.createPost(postData, authorId);

      expect(result).toEqual(mockPost);
      expect(postRepository.create).toHaveBeenCalled();
      expect(postRepository.setTags).toHaveBeenCalledWith(1, [1, 2]);
    });

    it('should throw error when slug already exists', async () => {
      const postData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
      };

      postRepository.findBySlug.mockResolvedValue({ id: 1 });

      await expect(postService.createPost(postData, 1)).rejects.toThrow('文章 slug 已存在');
    });

    it('should throw error when category does not exist', async () => {
      const postData = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        category_id: 999,
      };

      postRepository.findBySlug.mockResolvedValue(null);
      Category.findByPk.mockResolvedValue(null);

      await expect(postService.createPost(postData, 1)).rejects.toThrow('分类不存在');
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const postId = 1;
      const postData = {
        title: 'Updated Title',
        content: 'Updated content',
      };
      const mockPost = { id: 1, slug: 'test-post', title: 'Old Title' };
      const updatedPost = { ...mockPost, ...postData };

      postRepository.findById.mockResolvedValue(mockPost);
      postRepository.update.mockResolvedValue(updatedPost);
      postRepository.findById.mockResolvedValue(updatedPost);

      const result = await postService.updatePost(postId, postData, 1);

      expect(result).toEqual(updatedPost);
      expect(postRepository.update).toHaveBeenCalledWith(postId, expect.any(Object));
    });

    it('should throw error when post does not exist', async () => {
      postRepository.findById.mockResolvedValue(null);

      await expect(postService.updatePost(999, {}, 1)).rejects.toThrow('文章不存在');
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      const postId = 1;
      const mockPost = { id: 1, title: 'Test Post' };

      postRepository.findById.mockResolvedValue(mockPost);
      postRepository.delete.mockResolvedValue(mockPost);

      const result = await postService.deletePost(postId, 1);

      expect(result.message).toBe('文章已删除');
      expect(postRepository.delete).toHaveBeenCalledWith(postId);
    });
  });

  describe('getPublishedPost', () => {
    it('should get a published post', async () => {
      const postId = 1;
      const mockPost = { id: 1, status: 'published', title: 'Test Post' };

      postRepository.findById.mockResolvedValue(mockPost);

      const result = await postService.getPublishedPost(postId);

      expect(result).toEqual(mockPost);
    });

    it('should throw error when post is not published', async () => {
      const mockPost = { id: 1, status: 'draft' };

      postRepository.findById.mockResolvedValue(mockPost);

      await expect(postService.getPublishedPost(1)).rejects.toThrow('文章不存在或未发布');
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count when not locked', async () => {
      const postId = 1;
      const userIdentifier = 'user123';
      const mockPost = { id: 1, status: 'published' };

      postRepository.findById.mockResolvedValue(mockPost);
      redisClient.get.mockResolvedValue(null);
      redisClient.setEx.mockResolvedValue('OK');
      redisClient.incr.mockResolvedValue(1);

      const result = await postService.incrementViewCount(postId, userIdentifier);

      expect(result.incremented).toBe(true);
      expect(redisClient.setEx).toHaveBeenCalledWith(
        `post_view_lock:${postId}:${userIdentifier}`,
        300,
        '1'
      );
      expect(redisClient.incr).toHaveBeenCalledWith(`post_views:${postId}`);
    });

    it('should not increment when locked', async () => {
      const postId = 1;
      const userIdentifier = 'user123';
      const mockPost = { id: 1, status: 'published' };

      postRepository.findById.mockResolvedValue(mockPost);
      redisClient.get.mockResolvedValue('1');

      const result = await postService.incrementViewCount(postId, userIdentifier);

      expect(result.incremented).toBe(false);
      expect(redisClient.incr).not.toHaveBeenCalled();
    });
  });

  describe('syncViewCountsToDatabase', () => {
    it('should sync view counts from Redis to database', async () => {
      const mockKeys = ['post_views:1', 'post_views:2'];
      const mockPost1 = { id: 1, view_count: 10 };
      const mockPost2 = { id: 2, view_count: 20 };

      redisClient.keys.mockResolvedValue(mockKeys);
      redisClient.get.mockResolvedValueOnce('5').mockResolvedValueOnce('3');
      postRepository.findById
        .mockResolvedValueOnce(mockPost1)
        .mockResolvedValueOnce(mockPost2);
      postRepository.update.mockResolvedValue(true);
      redisClient.del.mockResolvedValue(1);

      const result = await postService.syncViewCountsToDatabase();

      expect(result.synced).toBe(2);
      expect(postRepository.update).toHaveBeenCalledWith('1', { view_count: 15 });
      expect(postRepository.update).toHaveBeenCalledWith('2', { view_count: 23 });
    });

    it('should return 0 when no view counts to sync', async () => {
      redisClient.keys.mockResolvedValue([]);

      const result = await postService.syncViewCountsToDatabase();

      expect(result.synced).toBe(0);
    });
  });
});
