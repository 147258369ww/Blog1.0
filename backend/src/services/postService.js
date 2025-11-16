const postRepository = require('../repositories/postRepository');
const { Category, Tag } = require('../models');
const { redisClient } = require('../config/redis');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class PostService {
  /**
   * 创建文章
   */
  async createPost(postData, authorId) {
    try {
      let { title, slug, summary, content, cover_image, category_id, status, is_featured, allow_comments, tag_ids } = postData;

      // 如果没有提供 slug，自动生成
      if (!slug) {
        // 使用标题生成 slug，移除特殊字符，转换为小写，用连字符连接
        slug = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // 移除特殊字符
          .replace(/\s+/g, '-') // 空格替换为连字符
          .replace(/-+/g, '-') // 多个连字符替换为单个
          .trim();
        
        // 如果生成的 slug 为空或只包含非字母数字字符，使用时间戳
        if (!slug || slug === '-') {
          slug = `post-${Date.now()}`;
        }
        
        // 确保 slug 唯一性，如果已存在则添加数字后缀
        let uniqueSlug = slug;
        let counter = 1;
        while (await postRepository.findBySlug(uniqueSlug, { includeDeleted: true })) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        slug = uniqueSlug;
      } else {
        // 验证 slug 唯一性
        const existingPost = await postRepository.findBySlug(slug, { includeDeleted: true });
        if (existingPost) {
          throw new Error('文章 slug 已存在');
        }
      }

      // 验证分类是否存在
      if (category_id) {
        const category = await Category.findByPk(category_id);
        if (!category) {
          throw new Error('分类不存在');
        }
      }

      // 验证标签是否存在
      if (tag_ids && tag_ids.length > 0) {
        const tags = await Tag.findAll({
          where: { id: tag_ids },
        });
        if (tags.length !== tag_ids.length) {
          throw new Error('部分标签不存在');
        }
      }

      // 创建文章
      const post = await postRepository.create({
        title,
        slug,
        summary,
        content,
        cover_image,
        author_id: authorId,
        category_id,
        status: status || 'draft',
        is_featured: is_featured || false,
        allow_comments: allow_comments !== undefined ? allow_comments : true,
        published_at: status === 'published' ? new Date() : null,
      });

      // 关联标签
      if (tag_ids && tag_ids.length > 0) {
        await postRepository.setTags(post.id, tag_ids);
      }

      // 重新获取完整的文章信息
      const createdPost = await postRepository.findById(post.id);
      
      logger.info(`Post created: ${post.id} by user ${authorId}`);
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.POSTS_PAGE}*`);
      await cacheService.deletePattern('category:*:posts:*');
      await cacheService.deletePattern('tag:*:posts:*');
      return createdPost;
    } catch (error) {
      logger.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * 更新文章
   */
  async updatePost(postId, postData, userId) {
    try {
      const { title, slug, summary, content, cover_image, category_id, status, is_featured, allow_comments, tag_ids } = postData;

      // 查找文章
      const post = await postRepository.findById(postId, { includeAssociations: false });
      if (!post) {
        throw new Error('文章不存在');
      }

      // 验证 slug 唯一性（如果修改了 slug）
      if (slug && slug !== post.slug) {
        const existingPost = await postRepository.findBySlug(slug, { includeDeleted: true });
        if (existingPost) {
          throw new Error('文章 slug 已存在');
        }
      }

      // 验证分类是否存在
      if (category_id) {
        const category = await Category.findByPk(category_id);
        if (!category) {
          throw new Error('分类不存在');
        }
      }

      // 验证标签是否存在
      if (tag_ids && tag_ids.length > 0) {
        const tags = await Tag.findAll({
          where: { id: tag_ids },
        });
        if (tags.length !== tag_ids.length) {
          throw new Error('部分标签不存在');
        }
      }

      // 准备更新数据
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (slug !== undefined) updateData.slug = slug;
      if (summary !== undefined) updateData.summary = summary;
      if (content !== undefined) updateData.content = content;
      if (cover_image !== undefined) updateData.cover_image = cover_image;
      if (category_id !== undefined) updateData.category_id = category_id;
      if (status !== undefined) {
        updateData.status = status;
        // 如果状态改为已发布且之前未发布，设置发布时间
        if (status === 'published' && !post.published_at) {
          updateData.published_at = new Date();
        }
      }
      if (is_featured !== undefined) updateData.is_featured = is_featured;
      if (allow_comments !== undefined) updateData.allow_comments = allow_comments;

      // 更新文章
      await postRepository.update(postId, updateData);

      // 更新标签
      if (tag_ids !== undefined) {
        await postRepository.setTags(postId, tag_ids);
      }

      // 重新获取完整的文章信息
      const updatedPost = await postRepository.findById(postId);
      
      logger.info(`Post updated: ${postId} by user ${userId}`);
      await cacheService.delete(cacheService.generateKey(cacheService.KEY_PREFIXES.POST, postId));
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.POSTS_PAGE}*`);
      await cacheService.deletePattern('category:*:posts:*');
      await cacheService.deletePattern('tag:*:posts:*');
      return updatedPost;
    } catch (error) {
      logger.error('Error updating post:', error);
      throw error;
    }
  }

  /**
   * 删除文章（软删除）
   */
  async deletePost(postId, userId) {
    try {
      const post = await postRepository.findById(postId, { includeAssociations: false });
      if (!post) {
        throw new Error('文章不存在');
      }

      await postRepository.delete(postId);
      
      logger.info(`Post deleted: ${postId} by user ${userId}`);
      await cacheService.delete(cacheService.generateKey(cacheService.KEY_PREFIXES.POST, postId));
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.POSTS_PAGE}*`);
      await cacheService.deletePattern('category:*:posts:*');
      await cacheService.deletePattern('tag:*:posts:*');
      return { message: '文章已删除' };
    } catch (error) {
      logger.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * 获取文章详情（公开接口）
   */
  async getPublishedPost(postId) {
    try {
      const key = cacheService.generateKey(cacheService.KEY_PREFIXES.POST, postId);
      const data = await cacheService.getOrSet(key, async () => {
        const post = await postRepository.findById(postId);
        if (!post || post.status !== 'published') {
          throw new Error('文章不存在或未发布');
        }
        return post;
      }, 300);
      return data;
    } catch (error) {
      logger.error('Error getting published post:', error);
      throw error;
    }
  }

  /**
   * 获取文章详情（管理员接口）
   */
  async getPost(postId, includeDeleted = false) {
    try {
      const post = await postRepository.findById(postId, { includeDeleted });
      
      if (!post) {
        throw new Error('文章不存在');
      }

      return post;
    } catch (error) {
      logger.error('Error getting post:', error);
      throw error;
    }
  }

  /**
   * 获取已发布文章列表（公开接口）
   */
  async getPublishedPosts(filters = {}, pagination = {}) {
    try {
      // 强制只返回已发布的文章
      const publicFilters = {
        ...filters,
        status: 'published',
      };

      const keyBase = `${cacheService.KEY_PREFIXES.POSTS_PAGE}${pagination.page || 1}:limit:${pagination.limit || 10}:sortBy:${pagination.sortBy || 'published_at'}:sortOrder:${pagination.sortOrder || 'DESC'}`;
      const filtersHash = Buffer.from(JSON.stringify(publicFilters)).toString('base64');
      const key = `${keyBase}:filters:${filtersHash}`;
      const data = await cacheService.getOrSet(key, async () => {
        return await postRepository.findAll(publicFilters, pagination, { includeDeleted: false });
      }, 120);
      return data;
    } catch (error) {
      logger.error('Error getting published posts:', error);
      throw error;
    }
  }

  /**
   * 获取所有文章列表（管理员接口）
   */
  async getAllPosts(filters = {}, pagination = {}, includeDeleted = false) {
    try {
      const result = await postRepository.findAll(filters, pagination, { includeDeleted });
      
      return result;
    } catch (error) {
      logger.error('Error getting all posts:', error);
      throw error;
    }
  }

  /**
   * 恢复已删除的文章
   */
  async restorePost(postId, userId) {
    try {
      const post = await postRepository.restore(postId);
      
      if (!post) {
        throw new Error('文章不存在或未被删除');
      }

      logger.info(`Post restored: ${postId} by user ${userId}`);
      await cacheService.delete(cacheService.generateKey(cacheService.KEY_PREFIXES.POST, postId));
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.POSTS_PAGE}*`);
      await cacheService.deletePattern('category:*:posts:*');
      await cacheService.deletePattern('tag:*:posts:*');
      return post;
    } catch (error) {
      logger.error('Error restoring post:', error);
      throw error;
    }
  }

  /**
   * 永久删除文章
   */
  async forceDeletePost(postId, userId) {
    try {
      const post = await postRepository.forceDelete(postId);
      
      if (!post) {
        throw new Error('文章不存在');
      }

      logger.info(`Post force deleted: ${postId} by user ${userId}`);
      await cacheService.delete(cacheService.generateKey(cacheService.KEY_PREFIXES.POST, postId));
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.POSTS_PAGE}*`);
      await cacheService.deletePattern('category:*:posts:*');
      await cacheService.deletePattern('tag:*:posts:*');
      return { message: '文章已永久删除' };
    } catch (error) {
      logger.error('Error force deleting post:', error);
      throw error;
    }
  }

  /**
   * 增加文章浏览量
   * 使用 Redis 缓存，防止 5 分钟内重复计数
   */
  async incrementViewCount(postId, userIdentifier) {
    try {
      // 验证文章是否存在且已发布
      const post = await postRepository.findById(postId, { includeAssociations: false });
      if (!post || post.status !== 'published') {
        throw new Error('文章不存在或未发布');
      }

      // 检查是否在 5 分钟内重复访问
      const lockKey = `post_view_lock:${postId}:${userIdentifier}`;
      const isLocked = await redisClient.get(lockKey);
      
      if (isLocked) {
        // 5 分钟内已访问过，不增加浏览量
        return { incremented: false, message: '浏览量未增加（防重复计数）' };
      }

      // 设置锁，5 分钟过期
      await redisClient.setEx(lockKey, 300, '1');

      // 增加 Redis 中的浏览量
      const viewCountKey = `post_views:${postId}`;
      await redisClient.incr(viewCountKey);

      logger.debug(`View count incremented for post ${postId}`);
      return { incremented: true, message: '浏览量已增加' };
    } catch (error) {
      logger.error('Error incrementing view count:', error);
      // 浏览量统计失败不应该影响文章访问，所以只记录错误
      return { incremented: false, message: '浏览量统计失败' };
    }
  }

  /**
   * 同步 Redis 中的浏览量到数据库
   * 应该由定时任务每小时调用一次
   */
  async syncViewCountsToDatabase() {
    try {
      logger.info('Starting view counts synchronization...');

      // 获取所有浏览量缓存的键
      const keys = await redisClient.keys('post_views:*');
      
      if (keys.length === 0) {
        logger.info('No view counts to sync');
        return { synced: 0 };
      }

      // 批量获取浏览量
      const viewCountsMap = {};
      for (const key of keys) {
        const postId = key.split(':')[1];
        const viewCount = await redisClient.get(key);
        
        if (viewCount) {
          viewCountsMap[postId] = parseInt(viewCount);
        }
      }

      // 更新数据库
      for (const [postId, cachedCount] of Object.entries(viewCountsMap)) {
        try {
          const post = await postRepository.findById(postId, { includeAssociations: false });
          if (post) {
            // 将 Redis 中的浏览量加到数据库中的浏览量
            const newViewCount = post.view_count + cachedCount;
            await postRepository.update(postId, { view_count: newViewCount });
            
            // 清除 Redis 中的浏览量缓存
            await redisClient.del(`post_views:${postId}`);
            
            logger.debug(`Synced ${cachedCount} views for post ${postId}, total: ${newViewCount}`);
          }
        } catch (error) {
          logger.error(`Error syncing view count for post ${postId}:`, error);
        }
      }

      logger.info(`View counts synchronized: ${Object.keys(viewCountsMap).length} posts updated`);
      return { synced: Object.keys(viewCountsMap).length };
    } catch (error) {
      logger.error('Error syncing view counts to database:', error);
      throw error;
    }
  }

  /**
   * 获取文章的实时浏览量（数据库 + Redis）
   */
  async getPostViewCount(postId) {
    try {
      const post = await postRepository.findById(postId, { includeAssociations: false });
      if (!post) {
        throw new Error('文章不存在');
      }

      // 获取数据库中的浏览量
      let totalViews = post.view_count;

      // 获取 Redis 中的浏览量
      const viewCountKey = `post_views:${postId}`;
      const cachedViews = await redisClient.get(viewCountKey);
      
      if (cachedViews) {
        totalViews += parseInt(cachedViews);
      }

      return totalViews;
    } catch (error) {
      logger.error('Error getting post view count:', error);
      throw error;
    }
  }
}

module.exports = new PostService();
