const { Link } = require('../models');
const { Op } = require('sequelize');

class LinkRepository {
  /**
   * 创建友链
   */
  async create(linkData) {
    return await Link.create(linkData);
  }

  /**
   * 根据 ID 查找友链
   */
  async findById(id) {
    return await Link.findByPk(id);
  }

  /**
   * 查询友链列表
   */
  async findAll(filters = {}, pagination = {}) {
    const { status } = filters;
    const {
      page = 1,
      limit = 50,
      sortBy = 'sort_order',
      sortOrder = 'ASC',
    } = pagination;

    const where = {};

    // 状态筛选
    if (status) {
      where.status = status;
    }

    const queryOptions = {
      where,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    };

    const { count, rows } = await Link.findAndCountAll(queryOptions);

    return {
      links: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    };
  }

  /**
   * 更新友链
   */
  async update(id, linkData) {
    const link = await Link.findByPk(id);
    if (!link) {
      return null;
    }

    await link.update(linkData);
    return link;
  }

  /**
   * 删除友链
   */
  async delete(id) {
    const link = await Link.findByPk(id);
    if (!link) {
      return null;
    }

    await link.destroy();
    return link;
  }

  /**
   * 统计友链数量
   */
  async count(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    return await Link.count({ where });
  }
}

module.exports = new LinkRepository();
