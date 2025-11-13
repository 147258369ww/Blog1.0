const statsService = require('../services/statsService');
const logger = require('../utils/logger');

class StatsController {
  /**
   * 获取博客统计数据
   * GET /api/v1/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await statsService.getBlogStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error in getStats controller:', error);
      next(error);
    }
  }

  /**
   * 获取文章统计信息（按状态分组）
   * GET /api/v1/stats/posts
   */
  async getPostStats(req, res, next) {
    try {
      const stats = await statsService.getPostStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('Error in getPostStats controller:', error);
      next(error);
    }
  }

  /**
   * 增加文章浏览量
   * POST /api/v1/stats/post/:id/view
   */
  async incrementPostView(req, res, next) {
    try {
      const postId = parseInt(req.params.id);

      if (isNaN(postId)) {
        return res.status(400).json({
          success: false,
          message: '无效的文章ID',
        });
      }

      await statsService.incrementPostView(postId);

      res.json({
        success: true,
        message: '浏览量已更新',
      });
    } catch (error) {
      logger.error('Error in incrementPostView controller:', error);
      next(error);
    }
  }
}

module.exports = new StatsController();
