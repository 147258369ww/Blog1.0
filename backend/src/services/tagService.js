const tagRepository = require('../repositories/tagRepository');
const searchService = require('./searchService');
const logger = require('../utils/logger');

class TagService {
  /**
   * 创建标签
   */
  async createTag(tagData) {
    try {
      const { name, slug, color } = tagData;

      // 验证 slug 唯一性
      const slugExists = await tagRepository.slugExists(slug);
      if (slugExists) {
        throw new Error('标签 slug 已存在');
      }

      // 验证颜色格式（如果提供）
      if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
        throw new Error('颜色格式不正确，应为十六进制颜色码（如 #FF5733）');
      }

      // 创建标签
      const tag = await tagRepository.create({
        name,
        slug,
        color: color || null,
      });

      logger.info(`Tag created: ${tag.id}`);
      return tag;
    } catch (error) {
      logger.error('Error creating tag:', error);
      throw error;
    }
  }

  /**
   * 更新标签
   */
  async updateTag(tagId, tagData) {
    try {
      const { name, slug, color } = tagData;

      // 查找标签
      const tag = await tagRepository.findById(tagId);
      if (!tag) {
        throw new Error('标签不存在');
      }

      // 验证 slug 唯一性（如果修改了 slug）
      if (slug && slug !== tag.slug) {
        const slugExists = await tagRepository.slugExists(slug, tagId);
        if (slugExists) {
          throw new Error('标签 slug 已存在');
        }
      }

      // 验证颜色格式（如果提供）
      if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
        throw new Error('颜色格式不正确，应为十六进制颜色码（如 #FF5733）');
      }

      // 准备更新数据
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (color !== undefined) updateData.color = color;

      // 更新标签
      const updatedTag = await tagRepository.update(tagId, updateData);

      logger.info(`Tag updated: ${tagId}`);
      return updatedTag;
    } catch (error) {
      logger.error('Error updating tag:', error);
      throw error;
    }
  }

  /**
   * 删除标签
   */
  async deleteTag(tagId) {
    try {
      // 查找标签
      const tag = await tagRepository.findById(tagId);
      if (!tag) {
        throw new Error('标签不存在');
      }

      // 检查是否有关联的文章
      const hasAssociatedPosts = await tagRepository.hasAssociatedPosts(tagId);
      if (hasAssociatedPosts) {
        throw new Error('该标签下有关联的文章，无法删除');
      }

      // 删除标签
      await tagRepository.delete(tagId);

      logger.info(`Tag deleted: ${tagId}`);
      return { message: '标签已删除' };
    } catch (error) {
      logger.error('Error deleting tag:', error);
      throw error;
    }
  }

  /**
   * 获取标签详情
   */
  async getTag(tagId, options = {}) {
    try {
      const tag = await tagRepository.findById(tagId, options);

      if (!tag) {
        throw new Error('标签不存在');
      }

      return tag;
    } catch (error) {
      logger.error('Error getting tag:', error);
      throw error;
    }
  }

  /**
   * 根据 slug 获取标签
   */
  async getTagBySlug(slug) {
    try {
      const tag = await tagRepository.findBySlug(slug);

      if (!tag) {
        throw new Error('标签不存在');
      }

      return tag;
    } catch (error) {
      logger.error('Error getting tag by slug:', error);
      throw error;
    }
  }

  /**
   * 获取标签列表
   */
  async getTags(filters = {}, options = {}) {
    try {
      const tags = await tagRepository.findAll(filters, options);
      return tags;
    } catch (error) {
      logger.error('Error getting tags:', error);
      throw error;
    }
  }

  /**
   * 根据 ID 数组获取标签
   */
  async getTagsByIds(tagIds) {
    try {
      const tags = await tagRepository.findByIds(tagIds);
      return tags;
    } catch (error) {
      logger.error('Error getting tags by ids:', error);
      throw error;
    }
  }

  /**
   * 获取热门标签
   */
  async getPopularTags(limit = 10) {
    try {
      const tags = await tagRepository.getPopularTags(limit);
      return tags;
    } catch (error) {
      logger.error('Error getting popular tags:', error);
      throw error;
    }
  }

  /**
   * 搜索标签
   */
  async searchTags(keyword) {
    try {
      const tags = await searchService.searchTags(keyword);
      return tags;
    } catch (error) {
      logger.error('Error searching tags:', error);
      throw error;
    }
  }

  /**
   * 统计标签数量
   */
  async countTags() {
    try {
      const count = await tagRepository.count();
      return count;
    } catch (error) {
      logger.error('Error counting tags:', error);
      throw error;
    }
  }

  /**
   * 获取标签下的文章列表
   */
  async getTagPosts(tagId, pagination = {}) {
    try {
      // 先验证标签是否存在
      const tag = await tagRepository.findById(tagId);
      if (!tag) {
        throw new Error('标签不存在');
      }

      // 获取标签下的文章
      const result = await tagRepository.getTagPosts(tagId, pagination);
      return result;
    } catch (error) {
      logger.error('Error getting tag posts:', error);
      throw error;
    }
  }
}

module.exports = new TagService();
