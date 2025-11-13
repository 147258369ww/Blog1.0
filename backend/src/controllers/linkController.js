const linkService = require('../services/linkService');
const logger = require('../utils/logger');

/**
 * 友链控制器
 * 处理友链相关的 HTTP 请求
 */
class LinkController {
  /**
   * 获取活跃友链列表（公开接口）
   * GET /api/v1/links
   */
  async getActiveLinks(req, res, next) {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'sort_order',
        sortOrder = 'ASC',
      } = req.query;

      const pagination = { page, limit, sortBy, sortOrder };

      const result = await linkService.getActiveLinks(pagination);

      res.status(200).json({
        success: true,
        data: result.links,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Get active links error:', error);
      next(error);
    }
  }

  /**
   * 获取所有友链列表（管理员接口）
   * GET /api/v1/admin/links
   */
  async getAllLinks(req, res, next) {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        sortBy = 'sort_order',
        sortOrder = 'ASC',
      } = req.query;

      const filters = {};
      if (status) filters.status = status;

      const pagination = { page, limit, sortBy, sortOrder };

      const result = await linkService.getAllLinks(filters, pagination);

      res.status(200).json({
        success: true,
        data: result.links,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      logger.error('Get all links error:', error);
      next(error);
    }
  }

  /**
   * 获取友链详情（管理员接口）
   * GET /api/v1/admin/links/:id
   */
  async getLink(req, res, next) {
    try {
      const { id } = req.params;

      const link = await linkService.getLink(id);

      res.status(200).json({
        success: true,
        data: link,
      });
    } catch (error) {
      logger.error('Get link error:', error);

      if (error.message === '友链不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LINK_NOT_FOUND',
            message: 'Link not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 创建友链（管理员接口）
   * POST /api/v1/admin/links
   */
  async createLink(req, res, next) {
    try {
      const linkData = req.body;

      const link = await linkService.createLink(linkData);

      res.status(201).json({
        success: true,
        data: link,
      });
    } catch (error) {
      logger.error('Create link error:', error);

      if (error.message === 'URL 格式不正确' || error.message === 'Logo URL 格式不正确') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_URL',
            message: error.message,
          },
        });
      }

      next(error);
    }
  }

  /**
   * 更新友链（管理员接口）
   * PUT /api/v1/admin/links/:id
   */
  async updateLink(req, res, next) {
    try {
      const { id } = req.params;
      const linkData = req.body;

      const link = await linkService.updateLink(id, linkData);

      res.status(200).json({
        success: true,
        data: link,
      });
    } catch (error) {
      logger.error('Update link error:', error);

      if (error.message === '友链不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LINK_NOT_FOUND',
            message: 'Link not found',
          },
        });
      }

      if (error.message === 'URL 格式不正确' || error.message === 'Logo URL 格式不正确') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_URL',
            message: error.message,
          },
        });
      }

      next(error);
    }
  }

  /**
   * 删除友链（管理员接口）
   * DELETE /api/v1/admin/links/:id
   */
  async deleteLink(req, res, next) {
    try {
      const { id } = req.params;

      const result = await linkService.deleteLink(id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Delete link error:', error);

      if (error.message === '友链不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LINK_NOT_FOUND',
            message: 'Link not found',
          },
        });
      }

      next(error);
    }
  }
}

module.exports = new LinkController();
