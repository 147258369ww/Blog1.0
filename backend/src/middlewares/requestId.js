const { v4: uuidv4 } = require('uuid');

/**
 * 请求 ID 中间件
 * 为每个请求生成唯一的 ID，用于日志追踪和调试
 * 
 * 功能：
 * - 从请求头读取现有的 X-Request-ID（如果有）
 * - 如果没有，生成新的 UUID
 * - 将请求 ID 添加到请求对象和响应头
 * - 便于跨服务追踪和日志关联
 */
const requestIdMiddleware = (req, res, next) => {
  // 从请求头获取或生成新的请求 ID
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  // 将请求 ID 附加到请求对象
  req.id = requestId;
  req.requestId = requestId;
  
  // 将请求 ID 添加到响应头
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

module.exports = requestIdMiddleware;
