const logger = require('../utils/logger');
const cacheService = require('../services/cacheService');

// 延迟加载 Redis 客户端，避免在模块加载时阻塞
let redisClient;
const getRedisClient = () => {
  if (!redisClient) {
    redisClient = require('../config/redis').redisClient;
  }
  return redisClient;
};

// 使用统一的 Redis 键前缀
const { KEY_PREFIXES } = cacheService;

/**
 * 频率限制中间件
 * 基于 Redis 实现滑动窗口频率限制
 */
class RateLimitMiddleware {
  /**
   * 创建频率限制中间件
   * @param {Object} options - 配置选项
   * @param {number} options.windowMs - 时间窗口（毫秒）
   * @param {number} options.maxRequests - 最大请求次数
   * @param {string} options.keyPrefix - Redis 键前缀
   * @param {string} options.message - 限制时的错误消息
   * @param {Function} options.keyGenerator - 键生成函数
   * @returns {Function} Express 中间件
   */
  static create(options = {}) {
    const {
      windowMs = 60000, // 默认1分钟
      maxRequests = 5,  // 默认5次
      keyPrefix = 'rate_limit',
      message = '请求过于频繁，请稍后再试',
      keyGenerator = (req) => req.ip // 默认使用IP地址
    } = options;

    return async (req, res, next) => {
      try {
        const client = getRedisClient();
        const key = `${keyPrefix}:${keyGenerator(req)}`;
        const now = Date.now();
        const windowStart = now - windowMs;

        // 获取当前窗口内的请求记录
        const requests = await client.lRange(key, 0, -1);
        
        // 过滤掉过期的时间戳
        const validRequests = requests
          .map(timestamp => parseInt(timestamp))
          .filter(timestamp => timestamp > windowStart);

        // 检查是否超过限制
        if (validRequests.length >= maxRequests) {
          const retryAfter = Math.ceil((validRequests[0] + windowMs - now) / 1000);
          
          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message,
              retryAfter,
            },
          });
        }

        // 添加当前请求时间戳
        await client.lPush(key, now.toString());
        
        // 设置过期时间
        await client.expire(key, Math.ceil(windowMs / 1000));
        
        // 限制列表长度，避免无限增长
        await client.lTrim(key, 0, maxRequests - 1);

        // 添加响应头信息
        res.set({
          'X-RateLimit-Limit': maxRequests,
          'X-RateLimit-Remaining': maxRequests - validRequests.length - 1,
          'X-RateLimit-Reset': Math.ceil((now + windowMs) / 1000),
        });

        next();
      } catch (error) {
        logger.error('Rate limit middleware error:', error);
        // 如果 Redis 出错，允许请求通过（fail-open 策略）
        next();
      }
    };
  }

  /**
   * 登录频率限制
   * - 同一IP：5次/分钟
   * - 同一账号：3次/分钟
   */
  static login() {
    return this.create({
      windowMs: 60000, // 1分钟
      maxRequests: 5,  // 5次
      keyPrefix: KEY_PREFIXES.RATE_LIMIT_LOGIN.slice(0, -1), // 移除末尾的冒号
      message: '登录尝试过于频繁，请15分钟后再试',
      keyGenerator: (req) => {
        // 优先使用账号标识，如果没有则使用IP
        const identifier = req.body?.email || req.ip;
        return identifier;
      }
    });
  }

  /**
   * 验证码发送频率限制
   * - 同一邮箱：1次/分钟，5次/小时
   * - 同一IP：10次/小时
   */
  static sendVerificationCode() {
    return async (req, res, next) => {
      try {
        const client = getRedisClient();
        const email = req.body?.email;
        const ip = req.ip;

        if (!email) {
          return next();
        }

        // 邮箱级别限制：1次/分钟
        const emailMinuteKey = `${KEY_PREFIXES.RATE_LIMIT_VERIFY_EMAIL_MINUTE}${email}`;
        const emailMinuteRequests = await client.lRange(emailMinuteKey, 0, -1);
        const now = Date.now();
        const minuteWindowStart = now - 60000;
        
        const validMinuteRequests = emailMinuteRequests
          .map(timestamp => parseInt(timestamp))
          .filter(timestamp => timestamp > minuteWindowStart);

        if (validMinuteRequests.length >= 1) {
          return res.status(429).json({
            success: false,
            error: {
              code: 'EMAIL_RATE_LIMIT',
              message: '验证码发送过于频繁，请1分钟后再试',
              retryAfter: 60,
            },
          });
        }

        // 邮箱级别限制：5次/小时
        const emailHourKey = `${KEY_PREFIXES.RATE_LIMIT_VERIFY_EMAIL_HOUR}${email}`;
        const emailHourRequests = await client.lRange(emailHourKey, 0, -1);
        const hourWindowStart = now - 3600000;
        
        const validHourRequests = emailHourRequests
          .map(timestamp => parseInt(timestamp))
          .filter(timestamp => timestamp > hourWindowStart);

        if (validHourRequests.length >= 5) {
          return res.status(429).json({
            success: false,
            error: {
              code: 'EMAIL_RATE_LIMIT',
              message: '今日验证码发送次数已达上限，请明天再试',
              retryAfter: 3600,
            },
          });
        }

        // IP级别限制：10次/小时
        const ipHourKey = `${KEY_PREFIXES.RATE_LIMIT_VERIFY_IP_HOUR}${ip}`;
        const ipHourRequests = await client.lRange(ipHourKey, 0, -1);
        
        const validIpRequests = ipHourRequests
          .map(timestamp => parseInt(timestamp))
          .filter(timestamp => timestamp > hourWindowStart);

        if (validIpRequests.length >= 10) {
          return res.status(429).json({
            success: false,
            error: {
              code: 'IP_RATE_LIMIT',
              message: 'IP地址发送验证码次数已达上限',
              retryAfter: 3600,
            },
          });
        }

        // 记录当前请求
        await Promise.all([
          client.lPush(emailMinuteKey, now.toString()),
          client.lPush(emailHourKey, now.toString()),
          client.lPush(ipHourKey, now.toString()),
        ]);

        // 设置过期时间
        await Promise.all([
          client.expire(emailMinuteKey, 60),
          client.expire(emailHourKey, 3600),
          client.expire(ipHourKey, 3600),
        ]);

        // 限制列表长度
        await Promise.all([
          client.lTrim(emailMinuteKey, 0, 0),
          client.lTrim(emailHourKey, 0, 4),
          client.lTrim(ipHourKey, 0, 9),
        ]);

        next();
      } catch (error) {
        logger.error('Verification code rate limit error:', error);
        next();
      }
    };
  }

  /**
   * 注册频率限制
   * - 同一IP：3次/小时
   */
  static register() {
    return this.create({
      windowMs: 3600000, // 1小时
      maxRequests: 3,     // 3次
      keyPrefix: KEY_PREFIXES.RATE_LIMIT_REGISTER.slice(0, -1),
      message: '注册次数已达上限，请1小时后再试',
    });
  }

  /**
   * 通用API频率限制
   * - 同一IP：100次/分钟
   */
  static api() {
    return this.create({
      windowMs: 60000,  // 1分钟
      maxRequests: 100, // 100次
      keyPrefix: KEY_PREFIXES.RATE_LIMIT_API.slice(0, -1),
      message: 'API请求过于频繁',
    });
  }
}

module.exports = RateLimitMiddleware;