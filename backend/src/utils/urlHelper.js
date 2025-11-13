const config = require('../config');

/**
 * 获取服务器基础 URL
 * @param {Object} req - Express 请求对象（可选）
 * @returns {string} 基础 URL
 */
function getBaseUrl(req = null) {
  // 1. 优先使用配置的 SERVER_BASE_URL
  if (config.server.baseUrl) {
    return config.server.baseUrl;
  }
  
  // 2. 如果启用自动检测且有请求对象，从请求中获取
  if (config.server.autoDetectBaseUrl && req) {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    return `${protocol}://${host}`;
  }
  
  // 3. 默认值（开发环境）
  return 'http://localhost:3000';
}

/**
 * 生成完整的文件访问 URL
 * @param {string} relativePath - 相对路径
 * @param {Object} req - Express 请求对象（可选）
 * @returns {string} 完整 URL
 */
function generateFileUrl(relativePath, req = null) {
  if (!relativePath) return '';
  
  // 如果已经是完整 URL，直接返回
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  const baseUrl = getBaseUrl(req);
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${baseUrl}${path}`;
}

module.exports = {
  getBaseUrl,
  generateFileUrl,
};
