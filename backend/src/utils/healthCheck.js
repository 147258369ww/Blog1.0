const { sequelize } = require('../config/database');
const { redisClient } = require('../config/redis');
const logger = require('./logger');

/**
 * 健康检查工具
 * 提供系统各组件的健康状态检查
 */
class HealthCheck {
  /**
   * 检查数据库健康状态
   * @returns {Promise<Object>} 数据库健康状态
   */
  async checkDatabase() {
    try {
      const startTime = Date.now();
      await sequelize.authenticate();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        message: 'Database connection is active',
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        message: error.message,
        error: error.name,
      };
    }
  }

  /**
   * 检查 Redis 健康状态
   * @returns {Promise<Object>} Redis 健康状态
   */
  async checkRedis() {
    try {
      if (!redisClient || !redisClient.isOpen) {
        return {
          status: 'unhealthy',
          message: 'Redis client is not connected',
        };
      }

      const startTime = Date.now();
      await redisClient.ping();
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        message: 'Redis connection is active',
      };
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return {
        status: 'unhealthy',
        message: error.message,
        error: error.name,
      };
    }
  }

  /**
   * 获取内存使用情况
   * @returns {Object} 内存使用信息
   */
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
    };
  }

  /**
   * 获取系统信息
   * @returns {Object} 系统信息
   */
  getSystemInfo() {
    return {
      platform: process.platform,
      nodeVersion: process.version,
      uptime: `${Math.floor(process.uptime())}s`,
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * 执行完整的健康检查
   * @returns {Promise<Object>} 完整的健康检查结果
   */
  async performHealthCheck() {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const isHealthy = database.status === 'healthy' && redis.status === 'healthy';

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database,
        redis,
      },
      system: this.getSystemInfo(),
      memory: this.getMemoryUsage(),
    };
  }
}

module.exports = new HealthCheck();
