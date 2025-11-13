const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool,
    logging: config.database.logging,
    // 数据库存储 UTC 时间，应用层转换显示
    timezone: '+00:00',
    dialectOptions: {
      connectTimeout: 10000, // 10 秒连接超时
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  }
);

// 数据库连接测试
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    return false;
  }
};

// 数据库同步
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    logger.info('Database synchronized successfully');
  } catch (error) {
    logger.error('Database synchronization failed:', error);
    throw error;
  }
};

// 数据库连接重试机制
const connectWithRetry = async (maxRetries = 5, retryDelay = 5000) => {
  for (let i = 0; i < maxRetries; i++) {
    const connected = await connectDatabase();
    if (connected) {
      return true;
    }
    
    if (i < maxRetries - 1) {
      logger.warn(`Database connection failed. Retrying in ${retryDelay / 1000}s... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw new Error('Failed to connect to database after maximum retries');
};

// 优雅关闭数据库连接
const closeDatabase = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// Export for Sequelize CLI migrations
module.exports = {
  sequelize,
  connectDatabase,
  syncDatabase,
  connectWithRetry,
  closeDatabase,
  // Sequelize CLI configuration
  development: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool,
    logging: config.database.logging,
    timezone: '+00:00',
  },
  test: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool,
    logging: false,
    timezone: '+00:00',
  },
  production: {
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    pool: config.database.pool,
    logging: false,
    timezone: '+00:00',
  },
};
