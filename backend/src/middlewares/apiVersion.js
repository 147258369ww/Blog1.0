const logger = require('../utils/logger');

/**
 * API 版本配置
 */
const API_VERSIONS = {
  v1: {
    status: 'stable',
    releaseDate: '2024-01-01',
    deprecationDate: null,
    sunsetDate: null,
    fullVersion: '1.0.0',
  },
  // 未来版本可以在这里添加
  // v2: {
  //   status: 'beta',
  //   releaseDate: '2024-12-01',
  //   deprecationDate: null,
  //   sunsetDate: null,
  //   fullVersion: '2.0.0-beta.1',
  // },
};

const LATEST_VERSION = 'v1';
const SUPPORTED_VERSIONS = ['v1'];
const DEPRECATED_VERSIONS = [];
const SUNSET_VERSIONS = [];

/**
 * 获取版本状态
 * @param {string} version - 版本号
 * @returns {string} 版本状态
 */
const getVersionStatus = (version) => {
  if (SUNSET_VERSIONS.includes(version)) return 'sunset';
  if (DEPRECATED_VERSIONS.includes(version)) return 'deprecated';
  if (SUPPORTED_VERSIONS.includes(version)) return API_VERSIONS[version]?.status || 'unknown';
  return 'unknown';
};

/**
 * 获取完整版本号
 * @param {string} version - 版本号
 * @returns {string} 完整版本号
 */
const getFullVersion = (version) => {
  return API_VERSIONS[version]?.fullVersion || version;
};

/**
 * 获取版本下线日期
 * @param {string} version - 版本号
 * @returns {string|null} 下线日期
 */
const getVersionSunsetDate = (version) => {
  return API_VERSIONS[version]?.sunsetDate;
};

/**
 * 获取迁移指南 URL
 * @param {string} version - 版本号
 * @returns {string} 迁移指南 URL
 */
const getMigrationGuideUrl = (version) => {
  const nextVersion = getNextVersion(version);
  return `/docs/migration/${version}-to-${nextVersion}`;
};

/**
 * 获取下一个版本
 * @param {string} currentVersion - 当前版本
 * @returns {string} 下一个版本
 */
const getNextVersion = (currentVersion) => {
  const versionNumber = parseInt(currentVersion.replace('v', ''), 10);
  return `v${versionNumber + 1}`;
};

/**
 * API 版本检测中间件
 * 
 * 功能：
 * - 从请求路径提取 API 版本
 * - 检查版本状态（稳定、弃用、下线）
 * - 添加版本相关的响应头
 * - 处理已下线的版本
 */
const apiVersionMiddleware = (req, res, next) => {
  // 从路径提取版本
  const versionMatch = req.path.match(/^\/api\/(v\d+)/);
  const version = versionMatch ? versionMatch[1] : LATEST_VERSION;
  
  // 附加到请求对象
  req.apiVersion = version;
  
  // 添加版本响应头
  res.setHeader('X-API-Version', getFullVersion(version));
  
  // 检查版本状态
  const versionStatus = getVersionStatus(version);
  
  // 处理未知版本
  if (versionStatus === 'unknown') {
    logger.warn(`Unknown API version requested: ${version}`);
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: `API version ${version} not found`,
      data: {
        supportedVersions: SUPPORTED_VERSIONS,
        latestVersion: LATEST_VERSION,
      },
    });
  }
  
  // 处理已弃用的版本
  if (versionStatus === 'deprecated') {
    const sunsetDate = getVersionSunsetDate(version);
    
    res.setHeader('Deprecation', 'true');
    if (sunsetDate) {
      res.setHeader('Sunset', new Date(sunsetDate).toUTCString());
    }
    res.setHeader('Link', `<${getMigrationGuideUrl(version)}>; rel="deprecation"`);
    
    logger.warn(`Deprecated API version used: ${version} by ${req.ip}`);
  }
  
  // 处理已下线的版本
  if (versionStatus === 'sunset') {
    logger.warn(`Sunset API version accessed: ${version} by ${req.ip}`);
    
    return res.status(410).json({
      success: false,
      statusCode: 410,
      message: `API ${version} has been sunset and is no longer available`,
      data: {
        sunsetDate: getVersionSunsetDate(version),
        currentVersion: LATEST_VERSION,
        migrationGuide: getMigrationGuideUrl(version),
        supportedVersions: SUPPORTED_VERSIONS,
      },
    });
  }
  
  next();
};

module.exports = {
  apiVersionMiddleware,
  API_VERSIONS,
  LATEST_VERSION,
  SUPPORTED_VERSIONS,
  DEPRECATED_VERSIONS,
  SUNSET_VERSIONS,
  getVersionStatus,
  getFullVersion,
};
