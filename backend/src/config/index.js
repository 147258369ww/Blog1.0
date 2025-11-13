const path = require('path');

// 只在环境变量未加载时才加载 dotenv
// 避免与外部的 dotenv 加载冲突
if (!process.env.PORT) {
  // 根据 NODE_ENV 加载对应的环境配置文件
  const envFile = process.env.NODE_ENV === 'production' 
    ? '.env.production' 
    : '.env.development';

  require('dotenv').config({ 
    path: path.resolve(process.cwd(), envFile) 
  });
}

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'REDIS_HOST',
  'REDIS_PORT',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
];

// 验证必需的环境变量
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres',
    timezone: process.env.DB_TIMEZONE || '+08:00',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },

  // Redis 配置
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRES_IN || '30m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    autoRefreshThreshold: parseInt(process.env.JWT_AUTO_REFRESH_THRESHOLD, 10) || 5, // 分钟
  },

  // SMTP 配置
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },

  // CORS 配置
  cors: {
    origins: process.env.CORS_ORIGINS 
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) 
      : ['http://localhost:3000'],
    credentials: true,
  },

  // HTTPS 配置
  https: {
    enabled: process.env.HTTPS_ENABLED === 'true',
    certPath: process.env.HTTPS_CERT_PATH || './ssl/fullchain.pem',
    keyPath: process.env.HTTPS_KEY_PATH || './ssl/privkey.pem',
  },

  // 服务器配置
  server: {
    // 服务器基础 URL，用于生成完整的文件访问链接
    // 如果不设置，将从请求中自动获取
    baseUrl: process.env.SERVER_BASE_URL || null,
    autoDetectBaseUrl: process.env.AUTO_DETECT_BASE_URL !== 'false', // 默认开启自动检测
  },

  // 文件上传配置
  upload: {
    maxImageSize: parseInt(process.env.UPLOAD_IMAGE_MAX_SIZE, 10) * 1024 * 1024 || 5 * 1024 * 1024, // 默认 5MB
    maxFileSize: parseInt(process.env.UPLOAD_FILE_MAX_SIZE, 10) * 1024 * 1024 || 10 * 1024 * 1024, // 默认 10MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    // 使用绝对路径，从配置文件所在目录向上两级到达 backend 目录，然后进入 uploads
    uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '..', '..', 'uploads'),
  },
};

module.exports = config;
