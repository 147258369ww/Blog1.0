const { Post, User, Category, Tag } = require('../models');
const { Op, literal } = require('sequelize');

class SearchService {
  /**
   * 搜索文章（使用 PostgreSQL 全文搜索）
   * @param {string} keyword - 搜索关键词
   * @param {object} pagination - 分页参数
   * @returns {object} 搜索结果和分页信息
   */
  async searchPosts(keyword, pagination = {}) {
    const {
      page = 1,
      limit = 10,
    } = pagination;

    if (!keyword || keyword.trim() === '') {
      return {
        posts: [],
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 0,
      };
    }

    // 清理关键词，移除特殊字符
    const cleanKeyword = keyword.trim().replace(/[^\w\s\u4e00-\u9fa5]/g, ' ');
    
    // 使用 PostgreSQL 全文搜索
    // to_tsvector 将文本转换为 tsvector 类型
    // to_tsquery 将搜索词转换为 tsquery 类型
    // ts_rank 计算相关度分数
    const searchQuery = cleanKeyword.split(/\s+/).join(' | ');

    const queryOptions = {
      where: {
        status: 'published',
        [Op.and]: [
          literal(`(
            to_tsvector('simple', COALESCE(title, '')) || 
            to_tsvector('simple', COALESCE(content, ''))
          ) @@ to_tsquery('simple', '${searchQuery.replace(/'/g, "''")}')`)
        ],
      },
      include: [
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
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] },
        },
      ],
      // 按相关度排序
      order: [
        [
          literal(`ts_rank(
            to_tsvector('simple', COALESCE(title, '') || ' ' || COALESCE(content, '')),
            to_tsquery('simple', '${searchQuery.replace(/'/g, "''")}')
          )`),
          'DESC'
        ],
        ['published_at', 'DESC'],
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
      subQuery: false,
    };

    try {
      const { count, rows } = await Post.findAndCountAll(queryOptions);

      return {
        posts: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      };
    } catch (error) {
      // 如果全文搜索失败，降级到 ILIKE 搜索
      console.error('Full-text search failed, falling back to ILIKE:', error.message);
      return this.searchPostsFallback(keyword, pagination);
    }
  }

  /**
   * 降级搜索方法（使用 ILIKE）
   * @param {string} keyword - 搜索关键词
   * @param {object} pagination - 分页参数
   * @returns {object} 搜索结果和分页信息
   */
  async searchPostsFallback(keyword, pagination = {}) {
    const {
      page = 1,
      limit = 10,
    } = pagination;

    const queryOptions = {
      where: {
        status: 'published',
        [Op.or]: [
          { title: { [Op.iLike]: `%${keyword}%` } },
          { content: { [Op.iLike]: `%${keyword}%` } },
        ],
      },
      include: [
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
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] },
        },
      ],
      order: [['published_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    };

    const { count, rows } = await Post.findAndCountAll(queryOptions);

    return {
      posts: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    };
  }

  /**
   * 搜索标签（模糊匹配）
   * @param {string} keyword - 搜索关键词
   * @returns {array} 标签列表
   */
  async searchTags(keyword) {
    if (!keyword || keyword.trim() === '') {
      return [];
    }

    const tags = await Tag.findAll({
      where: {
        name: { [Op.iLike]: `%${keyword}%` },
      },
      order: [['name', 'ASC']],
      limit: 20, // 限制返回数量
    });

    return tags;
  }
}

module.exports = new SearchService();
