const { Post, User, Category, Tag } = require('../models');
const { Op } = require('sequelize');

class PostRepository {
  /**
   * 创建文章
   */
  async create(postData) {
    return await Post.create(postData);
  }

  /**
   * 根据 ID 查找文章
   */
  async findById(id, options = {}) {
    const { includeDeleted = false, includeAssociations = true } = options;
    
    const queryOptions = {
      where: { id },
    };

    if (includeDeleted) {
      queryOptions.paranoid = false;
    }

    if (includeAssociations) {
      queryOptions.include = [
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
      ];
    }

    return await Post.findOne(queryOptions);
  }

  /**
   * 根据 slug 查找文章
   */
  async findBySlug(slug, options = {}) {
    const { includeDeleted = false, includeAssociations = true } = options;
    
    const queryOptions = {
      where: { slug },
    };

    if (includeDeleted) {
      queryOptions.paranoid = false;
    }

    if (includeAssociations) {
      queryOptions.include = [
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
      ];
    }

    return await Post.findOne(queryOptions);
  }

  /**
   * 查询文章列表
   */
  async findAll(filters = {}, pagination = {}, options = {}) {
    const {
      status,
      categoryId,
      tagId,
      authorId,
      isFeatured,
      keyword,
    } = filters;

    let {
      page = 1,
      limit = 10,
      sortBy = 'published_at',
      sortOrder = 'DESC',
    } = pagination;

    // 处理空字符串的情况
    if (!sortBy || sortBy.trim() === '') {
      sortBy = 'published_at';
    }
    if (!sortOrder || sortOrder.trim() === '') {
      sortOrder = 'DESC';
    }

    const { includeDeleted = false } = options;

    const where = {};

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 分类筛选
    if (categoryId) {
      where.category_id = categoryId;
    }

    // 作者筛选
    if (authorId) {
      where.author_id = authorId;
    }

    // 精选筛选
    if (isFeatured !== undefined) {
      where.is_featured = isFeatured;
    }

    // 关键词搜索
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${keyword}%` } },
        { content: { [Op.iLike]: `%${keyword}%` } },
      ];
    }

    const queryOptions = {
      where,
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
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    };

    // 标签筛选（需要特殊处理）
    if (tagId) {
      queryOptions.include[2].where = { id: tagId };
      queryOptions.include[2].required = true;
    }

    if (includeDeleted) {
      queryOptions.paranoid = false;
    }

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
   * 更新文章
   */
  async update(id, postData) {
    const post = await Post.findByPk(id);
    if (!post) {
      return null;
    }

    await post.update(postData);
    return post;
  }

  /**
   * 删除文章（软删除）
   */
  async delete(id) {
    const post = await Post.findByPk(id);
    if (!post) {
      return null;
    }

    await post.destroy();
    return post;
  }

  /**
   * 永久删除文章
   */
  async forceDelete(id) {
    const post = await Post.findByPk(id, { paranoid: false });
    if (!post) {
      return null;
    }

    await post.destroy({ force: true });
    return post;
  }

  /**
   * 恢复已删除的文章
   */
  async restore(id) {
    const post = await Post.findByPk(id, { paranoid: false });
    if (!post || !post.deleted_at) {
      return null;
    }

    await post.restore();
    return post;
  }

  /**
   * 更新文章浏览量
   */
  async incrementViewCount(id, increment = 1) {
    const post = await Post.findByPk(id);
    if (!post) {
      return null;
    }

    await post.increment('view_count', { by: increment });
    return post;
  }

  /**
   * 批量更新文章浏览量
   */
  async batchUpdateViewCounts(viewCountsMap) {
    const promises = Object.entries(viewCountsMap).map(([postId, count]) => {
      return Post.update(
        { view_count: count },
        { where: { id: postId } }
      );
    });

    await Promise.all(promises);
  }

  /**
   * 设置文章标签
   */
  async setTags(postId, tagIds) {
    const post = await Post.findByPk(postId);
    if (!post) {
      return null;
    }

    await post.setTags(tagIds);
    return post;
  }

  /**
   * 获取文章的标签
   */
  async getTags(postId) {
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'slug', 'color'],
          through: { attributes: [] },
        },
      ],
    });

    return post ? post.tags : [];
  }

  /**
   * 统计文章数量
   */
  async count(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.categoryId) {
      where.category_id = filters.categoryId;
    }

    if (filters.authorId) {
      where.author_id = filters.authorId;
    }

    return await Post.count({ where });
  }
}

module.exports = new PostRepository();
