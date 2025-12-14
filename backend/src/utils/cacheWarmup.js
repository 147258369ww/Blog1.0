const cacheService = require('../services/cacheService');
const logger = require('./logger');

/**
 * 缓存预热配置
 * 在应用启动时预加载常用数据到缓存
 */
async function warmupCache() {
  try {
    logger.info('Starting cache warmup...');

    // 延迟加载服务，避免循环依赖
    const postService = require('../services/postService');
    const categoryService = require('../services/categoryService');
    const tagService = require('../services/tagService');

    const warmupTasks = [
      // 首页文章列表
      {
        key: cacheService.generateKey(cacheService.KEY_PREFIXES.POSTS_PAGE, '1:limit:10:sortBy:published_at:sortOrder:DESC'),
        fetchFn: async () => {
          return await postService.getPublishedPosts(
            {},
            { page: 1, limit: 10, sortBy: 'published_at', sortOrder: 'DESC' }
          );
        },
        ttl: cacheService.CACHE_TTL.SHORT,
      },
      // 分类树
      {
        key: cacheService.KEY_PREFIXES.CATEGORY_TREE + 'all',
        fetchFn: async () => {
          return await categoryService.getCategoryTree();
        },
        ttl: cacheService.CACHE_TTL.LONG,
      },
      // 热门标签
      {
        key: cacheService.KEY_PREFIXES.TAG_POPULAR + '10',
        fetchFn: async () => {
          return await tagService.getPopularTags(10);
        },
        ttl: cacheService.CACHE_TTL.MEDIUM,
      },
    ];

    const results = await cacheService.warmup(warmupTasks);
    
    if (results.success > 0) {
      logger.info(`✅ Cache warmup completed: ${results.success}/${warmupTasks.length} tasks succeeded`);
    }
    
    if (results.failed > 0) {
      logger.warn(`⚠️  Cache warmup partial failure: ${results.failed}/${warmupTasks.length} tasks failed`);
    }

    return results;
  } catch (error) {
    logger.error('Cache warmup error:', error);
    // 预热失败不应该阻止应用启动
    return { success: 0, failed: 0, error: error.message };
  }
}

module.exports = { warmupCache };
