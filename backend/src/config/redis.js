const redis = require('redis');
const config = require('./index');
const logger = require('../utils/logger');

// 创建 Redis 客户端
const redisClient = redis.createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
    connectTimeout: 10000, // 10 秒连接超时
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        logger.error('Redis reconnection attempts exceeded');
        return new Error('Redis reconnection failed');
      }
      return Math.min(retries * 1000, 3000);
    },
  },
  password: config.redis.password,
  database: config.redis.db,
});

// 错误处理
redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

// 连接成功
redisClient.on('connect', () => {
  logger.info('Redis client connecting...');
});

redisClient.on('ready', () => {
  logger.info('Redis client connected successfully');
});

// 断开连接
redisClient.on('end', () => {
  logger.info('Redis client disconnected');
});

// 重新连接
redisClient.on('reconnecting', () => {
  logger.warn('Redis client reconnecting...');
});

// 连接 Redis
const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return true;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    return false;
  }
};

// Redis 连接重试机制
const connectRedisWithRetry = async (maxRetries = 5, retryDelay = 5000) => {
  for (let i = 0; i < maxRetries; i++) {
    const connected = await connectRedis();
    if (connected) {
      return true;
    }
    
    if (i < maxRetries - 1) {
      logger.warn(`Redis connection failed. Retrying in ${retryDelay / 1000}s... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Failed to connect to Redis after maximum retries');
};

// 优雅关闭 Redis 连接
const closeRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
};

module.exports = {
  redisClient,
  connectRedis,
  connectRedisWithRetry,
  closeRedis,
};
