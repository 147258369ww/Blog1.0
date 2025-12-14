const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const swaggerSpec = require('./config/swagger');
const morgan = require('morgan');
const logger = require('./utils/logger');
const ipLogger = require('./middlewares/ipLogger');
const autoRefreshToken = require('./middlewares/autoRefreshToken');
const requestIdMiddleware = require('./middlewares/requestId');
const healthCheck = require('./utils/healthCheck');
const { apiVersionMiddleware } = require('./middlewares/apiVersion');

const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// 信任代理，获取真实客户端IP
app.set('trust proxy', true);

// 自定义 morgan token 获取真实 IP
morgan.token('client-ip', (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress;
});

// CORS 配置
app.use(
  cors({
    origin: config.cors.origins,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Time', 'X-Content-Type-Options'],
  })
);

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// 请求 ID 中间件（必须在日志之前）
app.use(requestIdMiddleware);

// Morgan 日志中间件，使用自定义IP格式
app.use(morgan(':client-ip - :method :url :status :response-time ms', { stream: logger.stream }));

// IP 访问日志中间件
app.use(ipLogger);

// 解析 JSON 请求体（增加大小限制以支持大文件上传）
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(autoRefreshToken);

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
  })
);

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const sanitized = JSON.parse(
      JSON.stringify(body, (key, value) => (value === undefined ? undefined : value))
    );
    return originalJson(sanitized);
  };
  next();
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req) => (req.user ? 1000 : 100),
    keyGenerator: (req) => (req.user && req.user.id ? String(req.user.id) : req.ip),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// 静态文件服务 - 提供上传文件的访问
app.use('/uploads', express.static(config.upload.uploadDir, {
  maxAge: '1d', // 缓存1天
  setHeaders: (res, filePath) => {
    // 设置 CORS 头部，允许跨域访问图片
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // 根据文件类型设置 Content-Type
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      const ext = path.extname(filePath).slice(1).toLowerCase();
      res.setHeader('Content-Type', `image/${ext === 'jpg' ? 'jpeg' : ext}`);
    }
  }
}));

// Swagger API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Blog API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    const health = await healthCheck.performHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message,
    });
  }
});

// 简单的存活检查（不检查依赖）
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
  if (req.method === 'GET') {
    const p = req.path || '';
    let v = 'no-store';
    if (p.startsWith('/api/v1/tags') || p.startsWith('/api/v1/categories') || p.startsWith('/api/v1/links') || p.startsWith('/api/v1/settings')) {
      v = 'public, max-age=300, stale-while-revalidate=1800';
    } else if (p.startsWith('/api/v1/posts') || p.startsWith('/api/v1/stats')) {
      v = 'public, max-age=60, stale-while-revalidate=300';
    }
    res.setHeader('Cache-Control', v);
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

// API 版本检测中间件
app.use('/api', apiVersionMiddleware);

// API 路由
app.use('/api/v1', require('./routes/v1'));

// 404 处理
app.use(notFoundHandler);

// 错误处理中间件
app.use(errorHandler);

module.exports = app;
