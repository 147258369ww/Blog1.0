const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * 缓存服务类
 * 提供统一的 Redis 缓存操作接口，支持错误降级
 */
class CacheService {
  constructor() {
    // 缓存键命名规范前缀
    this.KEY_PREFIXES = {
      EMAIL_CODE: 'email_code:',           // 邮箱验证码
      REFRESH_TOKEN: 'refresh_token:',     // 刷新令牌
      POST_VIEWS: 'post_views:',           // 文章浏览量
      POST_VIEW_LOCK: 'post_view_lock:',   // 文章浏览防重复锁
      CONFIG: 'config:',                   // 系统配置
      USER_SESSION: 'user_session:',       // 用户会话
      POST: 'post:',
      POSTS_PAGE: 'posts:page:',
      CATEGORY: 'category:',
      CATEGORIES: 'categories:',
      CATEGORY_TREE: 'category_tree:',
      TAG: 'tag:',
      TAGS: 'tags:',
      TAG_POPULAR: 'tag_popular:'
    };
  }

  /**
   * 检查 Redis 连接是否可用
   * @returns {boolean} Redis 是否可用
   */
  isRedisAvailable() {
    try {
      return redisClient && redisClient.isOpen;
    } catch (error) {
      logger.error('Error checking Redis availability:', error);
      return false;
    }
  }

  /**
   * 从缓存获取值
   * @param {string} key - 缓存键
   * @returns {Promise<any|null>} 缓存值或 null
   */
  async get(key) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache get skipped for key: ${key}`);
        return null;
      }

      const value = await redisClient.get(key);
      
      if (value === null) {
        return null;
      }

      // 尝试解析 JSON
      try {
        return JSON.parse(value);
      } catch {
        // 如果不是 JSON，返回原始字符串
        return value;
      }
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      // 降级：返回 null，让调用方从数据库查询
      return null;
    }
  }

  /**
   * 设置缓存值
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 过期时间（秒），可选
   * @returns {Promise<boolean>} 是否设置成功
   */
  async set(key, value, ttl = null) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache set skipped for key: ${key}`);
        return false;
      }

      // 序列化值
      let serializedValue;
      if (typeof value === 'object') {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = String(value);
      }

      // 设置缓存
      if (ttl && ttl > 0) {
        await redisClient.setEx(key, ttl, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }

      logger.debug(`Cache set: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      // 降级：不抛出错误，让业务逻辑继续执行
      return false;
    }
  }

  async getOrSet(key, fetchFn, ttl = 3600) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }
    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   * @returns {Promise<boolean>} 是否删除成功
   */
  async delete(key) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache delete skipped for key: ${key}`);
        return false;
      }

      const result = await redisClient.del(key);
      logger.debug(`Cache deleted: ${key} (${result} keys removed)`);
      return result > 0;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      // 降级：不抛出错误
      return false;
    }
  }

  /**
   * 批量删除缓存（支持模式匹配）
   * @param {string} pattern - 键模式（如 'user:*'）
   * @returns {Promise<number>} 删除的键数量
   */
  async deletePattern(pattern) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache delete pattern skipped for: ${pattern}`);
        return 0;
      }

      const keys = await redisClient.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const result = await redisClient.del(keys);
      logger.debug(`Cache pattern deleted: ${pattern} (${result} keys removed)`);
      return result;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  async invalidatePattern(pattern) {
    return await this.deletePattern(pattern);
  }

  /**
   * 检查键是否存在
   * @param {string} key - 缓存键
   * @returns {Promise<boolean>} 键是否存在
   */
  async exists(key) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache exists check skipped for key: ${key}`);
        return false;
      }

      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * 设置键的过期时间
   * @param {string} key - 缓存键
   * @param {number} ttl - 过期时间（秒）
   * @returns {Promise<boolean>} 是否设置成功
   */
  async expire(key, ttl) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache expire skipped for key: ${key}`);
        return false;
      }

      const result = await redisClient.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * 获取键的剩余过期时间
   * @param {string} key - 缓存键
   * @returns {Promise<number>} 剩余秒数，-1 表示永不过期，-2 表示键不存在
   */
  async ttl(key) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache TTL check skipped for key: ${key}`);
        return -2;
      }

      return await redisClient.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * 原子递增
   * @param {string} key - 缓存键
   * @param {number} increment - 递增值，默认为 1
   * @returns {Promise<number|null>} 递增后的值，失败返回 null
   */
  async increment(key, increment = 1) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache increment skipped for key: ${key}`);
        return null;
      }

      if (increment === 1) {
        return await redisClient.incr(key);
      } else {
        return await redisClient.incrBy(key, increment);
      }
    } catch (error) {
      logger.error(`Cache increment error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 原子递减
   * @param {string} key - 缓存键
   * @param {number} decrement - 递减值，默认为 1
   * @returns {Promise<number|null>} 递减后的值，失败返回 null
   */
  async decrement(key, decrement = 1) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache decrement skipped for key: ${key}`);
        return null;
      }

      if (decrement === 1) {
        return await redisClient.decr(key);
      } else {
        return await redisClient.decrBy(key, decrement);
      }
    } catch (error) {
      logger.error(`Cache decrement error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 获取多个键的值
   * @param {string[]} keys - 缓存键数组
   * @returns {Promise<any[]>} 值数组
   */
  async mget(keys) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn('Redis unavailable, cache mget skipped');
        return keys.map(() => null);
      }

      if (keys.length === 0) {
        return [];
      }

      const values = await redisClient.mGet(keys);
      
      // 尝试解析 JSON
      return values.map(value => {
        if (value === null) {
          return null;
        }
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * 设置多个键值对
   * @param {Object} keyValuePairs - 键值对对象
   * @returns {Promise<boolean>} 是否设置成功
   */
  async mset(keyValuePairs) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn('Redis unavailable, cache mset skipped');
        return false;
      }

      const entries = Object.entries(keyValuePairs);
      if (entries.length === 0) {
        return true;
      }

      // 序列化所有值
      const serializedPairs = {};
      for (const [key, value] of entries) {
        if (typeof value === 'object') {
          serializedPairs[key] = JSON.stringify(value);
        } else {
          serializedPairs[key] = String(value);
        }
      }

      await redisClient.mSet(serializedPairs);
      logger.debug(`Cache mset: ${entries.length} keys`);
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * 获取所有匹配模式的键
   * @param {string} pattern - 键模式（如 'user:*'）
   * @returns {Promise<string[]>} 键数组
   */
  async keys(pattern) {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn(`Redis unavailable, cache keys search skipped for pattern: ${pattern}`);
        return [];
      }

      return await redisClient.keys(pattern);
    } catch (error) {
      logger.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * 清空所有缓存（谨慎使用）
   * @returns {Promise<boolean>} 是否清空成功
   */
  async flushAll() {
    try {
      if (!this.isRedisAvailable()) {
        logger.warn('Redis unavailable, cache flush skipped');
        return false;
      }

      await redisClient.flushAll();
      logger.warn('All cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * 生成标准化的缓存键
   * @param {string} prefix - 键前缀（使用 KEY_PREFIXES 中的常量）
   * @param {string|number} identifier - 标识符
   * @param {string} suffix - 可选的后缀
   * @returns {string} 标准化的缓存键
   */
  generateKey(prefix, identifier, suffix = '') {
    const key = `${prefix}${identifier}`;
    return suffix ? `${key}:${suffix}` : key;
  }

  /**
   * 获取缓存统计信息
   * @returns {Promise<Object>} 缓存统计信息
   */
  async getStats() {
    try {
      if (!this.isRedisAvailable()) {
        return {
          available: false,
          message: 'Redis is not available',
        };
      }

      const info = await redisClient.info('stats');
      const dbSize = await redisClient.dbSize();

      return {
        available: true,
        dbSize,
        info: info,
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        available: false,
        error: error.message,
      };
    }
  }
}

module.exports = new CacheService();
