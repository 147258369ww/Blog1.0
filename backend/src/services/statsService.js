const { Post, Tag } = require('../models');
const { redisClient } = require('../config/redis');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class StatsService {
  /**
   * 获取博客整体统计数据
   * 包括文章总数、标签总数、总访问量
   */
  async getBlogStats() {
    try {
      const key = 'stats:blog';
      const data = await cacheService.getOrSet(key, async () => {
        const totalPosts = await Post.count({
          where: {
            status: 'published',
          },
        });
        const totalTags = await Tag.count();
        const totalViews = await this.getTotalViewCount();
        return { totalPosts, totalTags, totalViews };
      }, 60);
      logger.debug('Blog stats retrieved successfully');
      return data;
    } catch (error) {
      logger.error('Error getting blog stats:', error);
      throw error;
    }
  }

  /**
   * 获取总访问量
   * 从数据库和 Redis 聚合统计数据
   */
  async getTotalViewCount() {
    try {
      // 获取数据库中所有文章的浏览量总和
      const dbViewCount = await Post.sum('view_count', {
        where: {
          status: 'published',
        },
      }) || 0;

      // 获取 Redis 中缓存的浏览量
      let redisViewCount = 0;
      try {
        const keys = await redisClient.keys('post_views:*');
        
        if (keys.length > 0) {
          for (const key of keys) {
            const count = await redisClient.get(key);
            if (count) {
              redisViewCount += parseInt(count);
            }
          }
        }
      } catch (redisError) {
        // Redis 错误不应该影响统计功能，只记录错误
        logger.warn('Error getting view counts from Redis:', redisError);
      }

      const totalViews = dbViewCount + redisViewCount;
      
      logger.debug(`Total view count: ${totalViews} (DB: ${dbViewCount}, Redis: ${redisViewCount})`);
      
      return totalViews;
    } catch (error) {
      logger.error('Error getting total view count:', error);
      throw error;
    }
  }

  /**
   * 获取文章统计信息
   * 按状态分组统计文章数量
   */
  async getPostStats() {
    try {
      const key = 'stats:posts';
      const data = await cacheService.getOrSet(key, async () => {
        const stats = await Post.findAll({
          attributes: [
            'status',
            [Post.sequelize.fn('COUNT', Post.sequelize.col('id')), 'count'],
          ],
          group: ['status'],
          raw: true,
        });
        const result = {
          draft: 0,
          published: 0,
          archived: 0,
        };
        stats.forEach(stat => {
          result[stat.status] = parseInt(stat.count);
        });
        return result;
      }, 60);
      return data;
    } catch (error) {
      logger.error('Error getting post stats:', error);
      throw error;
    }
  }

  /**
   * 增加文章浏览量
   * 使用 Redis 缓存，定期同步到数据库
   */
  async incrementPostView(postId) {
    try {
      // 检查文章是否存在
      const post = await Post.findByPk(postId);
      
      if (!post) {
        const error = new Error('文章不存在');
        error.statusCode = 404;
        throw error;
      }

      // 尝试使用 Redis 缓存浏览量
      try {
        const key = `post_views:${postId}`;
        await redisClient.incr(key);
        
        // 设置过期时间为 1 小时，之后会同步到数据库
        await redisClient.expire(key, 3600);
        
        logger.debug(`Incremented view count for post ${postId} in Redis`);
      } catch (redisError) {
        // 如果 Redis 失败，直接更新数据库
        logger.warn('Redis error, updating database directly:', redisError);
        await post.increment('view_count');
      }

      return true;
    } catch (error) {
      logger.error('Error incrementing post view:', error);
      throw error;
    }
  }
}

module.exports = new StatsService();
