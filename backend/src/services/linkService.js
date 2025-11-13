const linkRepository = require('../repositories/linkRepository');
const logger = require('../utils/logger');

class LinkService {
  /**
   * 验证 URL 格式
   */
  validateUrl(url) {
    try {
      const urlObj = new URL(url);
      // 只允许 http 和 https 协议
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 创建友链
   */
  async createLink(linkData) {
    try {
      const { name, url, logo, description, sort_order, status } = linkData;

      // 验证 URL 格式
      if (!this.validateUrl(url)) {
        throw new Error('URL 格式不正确');
      }

      // 验证 logo URL（如果提供）
      if (logo && !this.validateUrl(logo)) {
        throw new Error('Logo URL 格式不正确');
      }

      // 创建友链
      const link = await linkRepository.create({
        name,
        url,
        logo,
        description,
        sort_order: sort_order || 0,
        status: status || 'active',
      });

      logger.info(`Link created: ${link.id}`);
      return link;
    } catch (error) {
      logger.error('Error creating link:', error);
      throw error;
    }
  }

  /**
   * 更新友链
   */
  async updateLink(linkId, linkData) {
    try {
      const { name, url, logo, description, sort_order, status } = linkData;

      // 查找友链
      const link = await linkRepository.findById(linkId);
      if (!link) {
        throw new Error('友链不存在');
      }

      // 验证 URL 格式（如果修改了 URL）
      if (url && !this.validateUrl(url)) {
        throw new Error('URL 格式不正确');
      }

      // 验证 logo URL（如果提供）
      if (logo && !this.validateUrl(logo)) {
        throw new Error('Logo URL 格式不正确');
      }

      // 准备更新数据
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (url !== undefined) updateData.url = url;
      if (logo !== undefined) updateData.logo = logo;
      if (description !== undefined) updateData.description = description;
      if (sort_order !== undefined) updateData.sort_order = sort_order;
      if (status !== undefined) updateData.status = status;

      // 更新友链
      const updatedLink = await linkRepository.update(linkId, updateData);

      logger.info(`Link updated: ${linkId}`);
      return updatedLink;
    } catch (error) {
      logger.error('Error updating link:', error);
      throw error;
    }
  }

  /**
   * 删除友链
   */
  async deleteLink(linkId) {
    try {
      const link = await linkRepository.findById(linkId);
      if (!link) {
        throw new Error('友链不存在');
      }

      await linkRepository.delete(linkId);

      logger.info(`Link deleted: ${linkId}`);
      return { message: '友链已删除' };
    } catch (error) {
      logger.error('Error deleting link:', error);
      throw error;
    }
  }

  /**
   * 获取友链详情
   */
  async getLink(linkId) {
    try {
      const link = await linkRepository.findById(linkId);

      if (!link) {
        throw new Error('友链不存在');
      }

      return link;
    } catch (error) {
      logger.error('Error getting link:', error);
      throw error;
    }
  }

  /**
   * 获取活跃友链列表（公开接口）
   */
  async getActiveLinks(pagination = {}) {
    try {
      // 强制只返回活跃的友链
      const filters = { status: 'active' };

      const result = await linkRepository.findAll(filters, pagination);

      return result;
    } catch (error) {
      logger.error('Error getting active links:', error);
      throw error;
    }
  }

  /**
   * 获取所有友链列表（管理员接口）
   */
  async getAllLinks(filters = {}, pagination = {}) {
    try {
      const result = await linkRepository.findAll(filters, pagination);

      return result;
    } catch (error) {
      logger.error('Error getting all links:', error);
      throw error;
    }
  }
}

module.exports = new LinkService();
