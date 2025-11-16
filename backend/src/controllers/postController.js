const postService = require('../services/postService');
const searchService = require('../services/searchService');
const logger = require('../utils/logger');

/**
 * 文章控制器
 * 处理文章相关的 HTTP 请求
 */
class PostController {
  /**
   * 获取已发布文章列表（公开接口）
   * GET /api/v1/posts
   */
  async getPublishedPosts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        categoryId,
        tagId,
        isFeatured,
        sortBy = 'published_at',
        sortOrder = 'DESC',
      } = req.query;

      const filters = {};
      if (categoryId) filters.categoryId = categoryId;
      if (tagId) filters.tagId = tagId;
      if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';

      const pagination = { page, limit, sortBy, sortOrder };

      const result = await postService.getPublishedPosts(filters, pagination);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Get published posts error:', error);
      next(error);
    }
  }

  /**
   * 搜索文章（公开接口）
   * GET /api/v1/posts/search
   */
  async searchPosts(req, res, next) {
    try {
      const { keyword, page = 1, limit = 10 } = req.query;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_KEYWORD',
            message: 'Search keyword is required',
          },
        });
      }

      const pagination = { page, limit };
      const result = await searchService.searchPosts(keyword, pagination);

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Search posts error:', error);
      next(error);
    }
  }

  /**
   * 获取文章详情（公开接口）
   * GET /api/v1/posts/:id
   */
  async getPublishedPost(req, res, next) {
    try {
      const { id } = req.params;

      const post = await postService.getPublishedPost(id);

      // 增加浏览量（使用 IP 或用户 ID 作为标识）
      const userIdentifier = req.user?.id || req.ip || 'anonymous';
      await postService.incrementViewCount(id, userIdentifier);

      // 获取实时浏览量
      const viewCount = await postService.getPostViewCount(id);
      
      // 将实时浏览量添加到响应中
      const postData = typeof post.toJSON === 'function' ? post.toJSON() : post;
      postData.view_count = viewCount;

      res.status(200).json({
        success: true,
        data: postData,
      });
    } catch (error) {
      logger.error('Get published post error:', error);

      if (error.message === '文章不存在或未发布') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found or not published',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 获取所有文章列表（管理员接口）
   * GET /api/v1/admin/posts
   */
  async getAllPosts(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        categoryId,
        tagId,
        authorId,
        isFeatured,
        includeDeleted = 'false',
        sortBy = 'created_at',
        sortOrder = 'DESC',
      } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (categoryId) filters.categoryId = categoryId;
      if (tagId) filters.tagId = tagId;
      if (authorId) filters.authorId = authorId;
      if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';

      const pagination = { page, limit, sortBy, sortOrder };

      const result = await postService.getAllPosts(
        filters,
        pagination,
        includeDeleted === 'true'
      );

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Get all posts error:', error);
      next(error);
    }
  }

  /**
   * 获取文章详情（管理员接口）
   * GET /api/v1/admin/posts/:id
   */
  async getPost(req, res, next) {
    try {
      const { id } = req.params;
      const { includeDeleted = 'false' } = req.query;

      const post = await postService.getPost(id, includeDeleted === 'true');

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      logger.error('Get post error:', error);

      if (error.message === '文章不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 创建文章（管理员接口）
   * POST /api/v1/admin/posts
   */
  async createPost(req, res, next) {
    try {
      const postData = req.body;
      const authorId = req.user.id;

      const post = await postService.createPost(postData, authorId);

      res.status(201).json({
        success: true,
        data: post,
      });
    } catch (error) {
      logger.error('Create post error:', error);

      if (error.message === '文章 slug 已存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SLUG_EXISTS',
            message: 'Post slug already exists',
          },
        });
      }

      if (error.message === '分类不存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        });
      }

      if (error.message === '部分标签不存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'TAG_NOT_FOUND',
            message: 'Some tags not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 更新文章（管理员接口）
   * PUT /api/v1/admin/posts/:id
   */
  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const postData = req.body;
      const userId = req.user.id;

      const post = await postService.updatePost(id, postData, userId);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      logger.error('Update post error:', error);

      if (error.message === '文章不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        });
      }

      if (error.message === '文章 slug 已存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SLUG_EXISTS',
            message: 'Post slug already exists',
          },
        });
      }

      if (error.message === '分类不存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        });
      }

      if (error.message === '部分标签不存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'TAG_NOT_FOUND',
            message: 'Some tags not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 删除文章（管理员接口）
   * DELETE /api/v1/admin/posts/:id
   */
  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await postService.deletePost(id, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Delete post error:', error);

      if (error.message === '文章不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 更新文章状态（管理员接口）
   * PATCH /api/v1/admin/posts/:id/status
   */
  async updatePostStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      // 验证状态值
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Invalid status value',
          },
        });
      }

      // 准备更新数据
      const updateData = { status };
      
      // 如果状态改为已发布且之前未发布，设置发布时间
      const post = await postService.getPost(id);
      if (status === 'published' && !post.published_at) {
        updateData.published_at = new Date();
      }

      const updatedPost = await postService.updatePost(id, updateData, userId);

      res.status(200).json({
        success: true,
        data: updatedPost,
      });
    } catch (error) {
      logger.error('Update post status error:', error);

      if (error.message === '文章不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 恢复已删除的文章（管理员接口）
   * POST /api/v1/admin/posts/:id/restore
   */
  async restorePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const post = await postService.restorePost(id, userId);

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      logger.error('Restore post error:', error);

      if (error.message === '文章不存在或未被删除') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found or not deleted',
          },
        });
      }

      next(error);
    }
  }
}

module.exports = new PostController();
