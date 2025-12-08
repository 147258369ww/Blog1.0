const categoryService = require('../services/categoryService');
const logger = require('../utils/logger');

/**
 * 分类控制器
 * 处理分类相关的 HTTP 请求
 */
class CategoryController {
  /**
   * 获取分类列表（公开接口）
   * GET /api/v1/categories
   */
  async getCategories(req, res, next) {
    try {
      const { keyword, parentId, includeChildren = 'false' } = req.query;

      const filters = {};
      if (keyword) filters.keyword = keyword;
      if (parentId !== undefined) filters.parentId = parentId === 'null' ? null : parentId;

      const options = {
        includeChildren: includeChildren === 'true',
      };

      const categories = await categoryService.getCategories(filters, options);

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Get categories error:', error);
      next(error);
    }
  }

  /**
   * 获取分类详情（公开接口）
   * GET /api/v1/categories/:id
   */
  async getCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { includeChildren = 'false' } = req.query;

      const options = {
        includeChildren: includeChildren === 'true',
      };

      const category = await categoryService.getCategory(id, options);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Get category error:', error);

      if (error.message === '分类不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 获取分类树（公开接口）
   * GET /api/v1/categories/tree
   */
  async getCategoryTree(req, res, next) {
    try {
      const tree = await categoryService.getCategoryTree();

      res.status(200).json({
        success: true,
        data: tree,
      });
    } catch (error) {
      logger.error('Get category tree error:', error);
      next(error);
    }
  }

  /**
   * 获取分类下的文章（公开接口）
   * GET /api/v1/categories/:id/posts
   */
  async getCategoryPosts(req, res, next) {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'published_at',
        sortOrder = 'DESC',
      } = req.query;

      const pagination = { page, limit, sortBy, sortOrder };

      const result = await categoryService.getCategoryPosts(id, pagination);

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
      logger.error('Get category posts error:', error);

      if (error.message === '分类不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 创建分类（管理员接口）
   * POST /api/v1/admin/categories
   */
  async createCategory(req, res, next) {
    try {
      const categoryData = req.body;

      const category = await categoryService.createCategory(categoryData);

      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('category:create', uid, {
          resourceType: 'category',
          resourceId: category.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
        });
      } catch (_) {}

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Create category error:', error);

      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('category:create', uid, {
          status: 'failure',
          resourceType: 'category',
          resourceId: null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
          error: error.message,
        });
      } catch (_) {}

      if (error.message === '分类 slug 已存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SLUG_EXISTS',
            message: 'Category slug already exists',
          },
        });
      }

      if (error.message === '父分类不存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PARENT_NOT_FOUND',
            message: 'Parent category not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 更新分类（管理员接口）
   * PUT /api/v1/admin/categories/:id
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const categoryData = req.body;

      const category = await categoryService.updateCategory(id, categoryData);

      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('category:update', uid, {
          resourceType: 'category',
          resourceId: id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
        });
      } catch (_) {}

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      logger.error('Update category error:', error);

      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('category:update', uid, {
          status: 'failure',
          resourceType: 'category',
          resourceId: req.params?.id || null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
          error: error.message,
        });
      } catch (_) {}

      if (error.message === '分类不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        });
      }

      if (error.message === '分类 slug 已存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SLUG_EXISTS',
            message: 'Category slug already exists',
          },
        });
      }

      if (error.message === '父分类不存在') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PARENT_NOT_FOUND',
            message: 'Parent category not found',
          },
        });
      }

      if (error.message === '不能将分类设置为自己的子分类') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARENT',
            message: 'Cannot set category as its own child',
          },
        });
      }

      if (error.message === '不能将分类设置为其子分类的子分类（循环引用）') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CIRCULAR_REFERENCE',
            message: 'Cannot create circular reference in category hierarchy',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 删除分类（管理员接口）
   * DELETE /api/v1/admin/categories/:id
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      const result = await categoryService.deleteCategory(id);

      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('category:delete', uid, {
          resourceType: 'category',
          resourceId: id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
        });
      } catch (_) {}

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Delete category error:', error);

      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('category:delete', uid, {
          status: 'failure',
          resourceType: 'category',
          resourceId: req.params?.id || null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
          error: error.message,
        });
      } catch (_) {}

      if (error.message === '分类不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_FOUND',
            message: 'Category not found',
          },
        });
      }

      if (error.message === '该分类下有关联的文章，无法删除') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'HAS_ASSOCIATED_POSTS',
            message: 'Cannot delete category with associated posts',
          },
        });
      }

      if (error.message === '该分类下有子分类，无法删除') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'HAS_CHILDREN',
            message: 'Cannot delete category with child categories',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 更新分类排序（管理员接口）
   * PUT /api/v1/admin/categories/sort
   */
  async updateCategorySort(req, res, next) {
    try {
      const sortData = req.body;

      if (!Array.isArray(sortData)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: 'Sort data must be an array',
          },
        });
      }

      await categoryService.updateCategorySort(sortData);

      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('category:update_sort', uid, {
          resourceType: 'category',
          resourceId: null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
        });
      } catch (_) {}

      res.status(200).json({
        success: true,
        message: 'Category sort updated successfully',
      });
    } catch (error) {
      logger.error('Update category sort error:', error);
      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('category:update_sort', uid, {
          status: 'failure',
          resourceType: 'category',
          resourceId: null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
          error: error.message,
        });
      } catch (_) {}
      next(error);
    }
  }
}

module.exports = new CategoryController();
