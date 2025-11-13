const { Tag, Post } = require('../models');
const { Op } = require('sequelize');

class TagRepository {
  /**
   * 创建标签
   */
  async create(tagData) {
    return await Tag.create(tagData);
  }

  /**
   * 根据 ID 查找标签
   */
  async findById(id, options = {}) {
    const { includePosts = false } = options;
    
    const queryOptions = {
      where: { id },
    };

    if (includePosts) {
      queryOptions.include = [
        {
          model: Post,
          as: 'posts',
          attributes: ['id', 'title', 'slug', 'status'],
          through: { attributes: [] },
        },
      ];
    }

    return await Tag.findOne(queryOptions);
  }

  /**
   * 根据 slug 查找标签
   */
  async findBySlug(slug) {
    return await Tag.findOne({
      where: { slug },
    });
  }

  /**
   * 查询标签列表
   */
  async findAll(filters = {}, options = {}) {
    const { keyword } = filters;
    const { sortBy = 'name', sortOrder = 'ASC' } = options;
    const { sequelize } = require('../models');

    const where = {};

    // 关键词搜索
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${keyword}%` } },
      ];
    }

    const queryOptions = {
      attributes: [
        'id',
        'name',
        'slug',
        'color',
        'created_at',
        'updated_at',
        [sequelize.fn('COUNT', sequelize.col('posts.id')), 'postCount'],
      ],
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: [],
          through: { attributes: [] },
          where: { status: 'published' },
          required: false,
        },
      ],
      where,
      group: ['Tag.id'],
      order: [[sortBy, sortOrder]],
      subQuery: false,
    };

    const tags = await Tag.findAll(queryOptions);
    
    // 将 postCount 转换为数字类型
    return tags.map(tag => {
      const tagData = tag.toJSON();
      tagData.postCount = parseInt(tagData.postCount) || 0;
      return tagData;
    });
  }

  /**
   * 根据 ID 数组查找标签
   */
  async findByIds(ids) {
    return await Tag.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
  }

  /**
   * 更新标签
   */
  async update(id, tagData) {
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return null;
    }

    await tag.update(tagData);
    return tag;
  }

  /**
   * 删除标签
   */
  async delete(id) {
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return null;
    }

    await tag.destroy();
    return tag;
  }

  /**
   * 检查标签是否有关联的文章
   */
  async hasAssociatedPosts(id) {
    const tag = await Tag.findByPk(id, {
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
    });

    return tag && tag.posts && tag.posts.length > 0;
  }

  /**
   * 检查 slug 是否已存在
   */
  async slugExists(slug, excludeId = null) {
    const where = { slug };
    
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const tag = await Tag.findOne({ where });
    return !!tag;
  }

  /**
   * 统计标签数量
   */
  async count() {
    return await Tag.count();
  }

  /**
   * 获取热门标签（按关联文章数量排序）
   */
  async getPopularTags(limit = 10) {
    const { sequelize } = require('../models');
    
    const tags = await Tag.findAll({
      attributes: [
        'id',
        'name',
        'slug',
        'color',
        [sequelize.fn('COUNT', sequelize.col('posts.id')), 'postCount'],
      ],
      include: [
        {
          model: Post,
          as: 'posts',
          attributes: [],
          through: { attributes: [] },
          where: { status: 'published' },
          required: false,
        },
      ],
      group: ['Tag.id'],
      order: [[sequelize.literal('postCount'), 'DESC']],
      limit: parseInt(limit),
      subQuery: false,
    });

    // 将 postCount 转换为数字类型
    return tags.map(tag => {
      const tagData = tag.toJSON();
      tagData.postCount = parseInt(tagData.postCount) || 0;
      return tagData;
    });
  }

  /**
   * 获取标签下的文章列表（带分页）
   */
  async getTagPosts(tagId, pagination = {}) {
    const { User, Category } = require('../models');
    const {
      page = 1,
      pageSize = 12,
    } = pagination;

    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;

    // 查询标签下的已发布文章
    const { count, rows } = await Post.findAndCountAll({
      attributes: [
        'id',
        'title',
        'slug',
        'summary',
        'cover_image',
        'published_at',
        'view_count',
        'is_featured',
        'created_at',
        'updated_at',
      ],
      include: [
        {
          model: Tag,
          as: 'tags',
          where: { id: tagId },
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] },
          required: true,
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'nickname', 'avatar'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      where: {
        status: 'published',
      },
      order: [['published_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      posts: rows,
      total: count,
      page: parseInt(page),
      pageSize: limit,
      totalPages: Math.ceil(count / limit),
    };
  }
}

module.exports = new TagRepository();
