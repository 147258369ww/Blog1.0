const winston = require('winston');
const path = require('path');
const fs = require('fs');

// 确保日志目录存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack 
      ? `${timestamp} [${level.toUpperCase()}]: ${message}
${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// 日志轮转配置
const logRotationConfig = {
  maxsize: parseInt(process.env.LOG_MAX_SIZE, 10) || 10485760, // 默认 10MB
  maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || (process.env.NODE_ENV === 'production' ? 30 : 7), // 生产环境保留30天，开发环境7天
  tailable: true, // 最新的日志在 .log 文件中
  zippedArchive: process.env.NODE_ENV === 'production', // 生产环境压缩旧日志
};

// 创建 logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  transports: [
    // 错误日志
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      ...logRotationConfig,
    }),
    // 所有日志
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      ...logRotationConfig,
    }),
  ],
});

// 控制台输出（所有环境）
logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return stack 
          ? `${timestamp} ${level}: ${message}\n${stack}`
          : `${timestamp} ${level}: ${message}`;
      })
    ),
  })
);

// 创建一个 stream 对象，用于 morgan
logger.stream = {
  write: (message) => {
    // 移除 morgan 添加的额外换行符
    logger.info(message.trim());
  },
};

module.exports = logger;
