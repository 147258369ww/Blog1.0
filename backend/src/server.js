const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const config = require('./config');
const { connectWithRetry, closeDatabase, syncDatabase } = require('./config/database');
const { connectRedisWithRetry, closeRedis } = require('./config/redis');
const logger = require('./utils/logger');

let server;

// 创建服务器实例
const createServer = () => {
  // HTTPS 服务器配置
  if (config.https.enabled) {
    try {
      logger.info('🔒 正在启用 HTTPS...');
      const certPath = path.resolve(config.https.certPath);
      const keyPath = path.resolve(config.https.keyPath);

      // 验证证书文件是否存在
      if (!fs.existsSync(certPath)) {
        throw new Error(`SSL 证书文件不存在: ${certPath}`);
      }
      if (!fs.existsSync(keyPath)) {
        throw new Error(`SSL 私钥文件不存在: ${keyPath}`);
      }

      const httpsOptions = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      };

      const httpsServer = https.createServer(httpsOptions, app);
      logger.info('✅ HTTPS 已启用');
      return { server: httpsServer, protocol: 'HTTPS' };
    } catch (error) {
      logger.error('❌ HTTPS 启动失败:', error.message);
      logger.warn('⚠️  降级使用 HTTP');
      return { server: http.createServer(app), protocol: 'HTTP' };
    }
  } else {
    logger.info('🌐 使用 HTTP 协议');
    return { server: http.createServer(app), protocol: 'HTTP' };
  }
};

// 启动服务器
const startServer = async () => {
  try {
    logger.info('========================================');
    logger.info('🚀 开始启动服务器...');
    logger.info(`📝 运行环境: ${config.env}`);
    logger.info(`🔌 端口号: ${config.port}`);
    logger.info('========================================');

    // 初始化数据库连接
    logger.info('📊 正在连接数据库...');
    logger.info(`   数据库地址: ${config.database.host}:${config.database.port}`);
    logger.info(`   数据库名称: ${config.database.name}`);
    await connectWithRetry();
    logger.info('✅ 数据库连接成功');

    // 同步数据库模型（开发环境）
    if (config.env === 'development') {
      logger.info('🔄 正在同步数据库模型...');
      await syncDatabase({ alter: true });
      logger.info('✅ 数据库模型同步完成');
    }

    // 初始化 Redis 连接
    logger.info('� 正在运连接 Redis...');
    logger.info(`   Redis 地址: ${config.redis.host}:${config.redis.port}`);
    await connectRedisWithRetry();
    logger.info('✅ Redis 连接成功');

    // 创建并启动 HTTP/HTTPS 服务器
    logger.info('🌐 正在启动 Web 服务器...');
    const { server: httpServer, protocol } = createServer();
    server = httpServer;
    server.listen(config.port, () => {
      logger.info('========================================');
      logger.info('✅ 服务器启动成功！');
      logger.info(`🌍 服务地址: ${protocol}://localhost:${config.port}`);
      logger.info(`📚 API 文档: ${protocol}://localhost:${config.port}/api-docs`);
      logger.info(`🏥 健康检查: ${protocol}://localhost:${config.port}/health`);
      logger.info('========================================');
    });
  } catch (error) {
    logger.error('========================================');
    logger.error('❌ 服务器启动失败');
    logger.error('错误信息:', error.message);
    logger.error('========================================');
    process.exit(1);
  }
};

// 优雅关闭
const gracefulShutdown = async (signal) => {
  logger.info(`\n收到 ${signal} 信号，正在优雅关闭...`);
  
  server.close(async () => {
    logger.info('✅ HTTP 服务器已关闭');

    try {
      // 关闭数据库连接
      await closeDatabase();
      logger.info('✅ 数据库连接已关闭');

      // 关闭 Redis 连接
      await closeRedis();
      logger.info('✅ Redis 连接已关闭');

      process.exit(0);
    } catch (error) {
      logger.error('❌ 关闭过程中出错:', error);
      process.exit(1);
    }
  });

  // 强制关闭超时
  setTimeout(() => {
    logger.error('⚠️  超时后强制关闭');
    process.exit(1);
  }, 10000);
};

// 监听关闭信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('❌ 未捕获的异常:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ 未处理的 Promise 拒绝:', promise, '原因:', reason);
  gracefulShutdown('unhandledRejection');
});

// 启动服务器
startServer();
