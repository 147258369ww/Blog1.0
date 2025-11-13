const tagService = require('../services/tagService');
const logger = require('../utils/logger');

/**
 * 标签控制器
 * 处理标签相关的 HTTP 请求
 */
class TagController {
  /**
   * 获取标签列表（公开接口）
   * GET /api/v1/tags
   */
  async getTags(req, res, next) {
    try {
      const { keyword, sortBy = 'name', sortOrder = 'ASC' } = req.query;

      const filters = {};
      if (keyword) filters.keyword = keyword;

      const options = { sortBy, sortOrder };

      const tags = await tagService.getTags(filters, options);

      res.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error) {
      logger.error('Get tags error:', error);
      next(error);
    }
  }

  /**
   * 获取标签详情（公开接口）
   * GET /api/v1/tags/:id
   */
  async getTag(req, res, next) {
    try {
      const { id } = req.params;

      const tag = await tagService.getTag(id);

      res.status(200).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      logger.error('Get tag error:', error);

      if (error.message === '标签不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TAG_NOT_FOUND',
            message: 'Tag not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 获取热门标签（公开接口）
   * GET /api/v1/tags/popular
   */
  async getPopularTags(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const tags = await tagService.getPopularTags(limit);

      res.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error) {
      logger.error('Get popular tags error:', error);
      next(error);
    }
  }

  /**
   * 搜索标签（公开接口）
   * GET /api/v1/tags/search
   */
  async searchTags(req, res, next) {
    try {
      const { keyword } = req.query;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_KEYWORD',
            message: 'Search keyword is required',
          },
        });
      }

      const tags = await tagService.searchTags(keyword);

      res.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error) {
      logger.error('Search tags error:', error);
      next(error);
    }
  }

  /**
   * 创建标签（管理员接口）
   * POST /api/v1/admin/tags
   */
  async createTag(req, res, next) {
    try {
      const tagData = req.body;

      const tag = await tagService.createTag(tagData);

      res.status(201).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      logger.error('Create tag error:', error);

      if (error.message === '标签 slug 已存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SLUG_EXISTS',
            message: 'Tag slug already exists',
          },
        });
      }

      if (error.message.includes('颜色格式不正确')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COLOR',
            message: 'Invalid color format. Use hex color code (e.g., #FF5733)',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 更新标签（管理员接口）
   * PUT /api/v1/admin/tags/:id
   */
  async updateTag(req, res, next) {
    try {
      const { id } = req.params;
      const tagData = req.body;

      const tag = await tagService.updateTag(id, tagData);

      res.status(200).json({
        success: true,
        data: tag,
      });
    } catch (error) {
      logger.error('Update tag error:', error);

      if (error.message === '标签不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TAG_NOT_FOUND',
            message: 'Tag not found',
          },
        });
      }

      if (error.message === '标签 slug 已存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SLUG_EXISTS',
            message: 'Tag slug already exists',
          },
        });
      }

      if (error.message.includes('颜色格式不正确')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COLOR',
            message: 'Invalid color format. Use hex color code (e.g., #FF5733)',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 删除标签（管理员接口）
   * DELETE /api/v1/admin/tags/:id
   */
  async deleteTag(req, res, next) {
    try {
      const { id } = req.params;

      const result = await tagService.deleteTag(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Delete tag error:', error);

      if (error.message === '标签不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TAG_NOT_FOUND',
            message: 'Tag not found',
          },
        });
      }

      if (error.message === '该标签下有关联的文章，无法删除') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'HAS_ASSOCIATED_POSTS',
            message: 'Cannot delete tag with associated posts',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 获取标签下的文章列表（公开接口）
   * GET /api/v1/tags/:id/posts
   */
  async getTagPosts(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 12 } = req.query;

      const result = await tagService.getTagPosts(id, { page, pageSize });

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Get tag posts error:', error);

      if (error.message === '标签不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TAG_NOT_FOUND',
            message: 'Tag not found',
          },
        });
      }

      next(error);
    }
  }
}

module.exports = new TagController();
