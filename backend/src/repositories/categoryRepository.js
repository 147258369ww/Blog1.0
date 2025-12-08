const { Category, Post, sequelize } = require('../models');
const { Op } = require('sequelize');

async function withRetry(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (String(error.message || '').includes('ECONNRESET') || String(error.code || '') === 'ECONNRESET')) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

class CategoryRepository {
  /**
   * 创建分类
   */
  async create(categoryData) {
    return await Category.create(categoryData);
  }

  /**
   * 根据 ID 查找分类
   */
  async findById(id, options = {}) {
    const { includeChildren = false, includePosts = false } = options;
    
    const queryOptions = {
      where: { id },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM posts 
              WHERE posts.category_id = "Category"."id" 
              AND posts.status = 'published'
            )`),
            'post_count'
          ]
        ]
      },
    };

    if (includeChildren || includePosts) {
      queryOptions.include = [];
      
      if (includeChildren) {
        queryOptions.include.push({
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'description', 'sort_order'],
        });
      }

      if (includePosts) {
        queryOptions.include.push({
          model: Post,
          as: 'posts',
          attributes: ['id', 'title', 'slug', 'status'],
        });
      }
    }

    return await Category.findOne(queryOptions);
  }

  /**
   * 根据 slug 查找分类
   */
  async findBySlug(slug, options = {}) {
    const { includeChildren = false } = options;
    
    const queryOptions = {
      where: { slug },
    };

    if (includeChildren) {
      queryOptions.include = [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'description', 'sort_order'],
        },
      ];
    }

    return await Category.findOne(queryOptions);
  }

  /**
   * 查询分类列表
   */
  async findAll(filters = {}, options = {}) {
    const { parentId, keyword } = filters;
    const { includeChildren = false, sortBy = 'sort_order', sortOrder = 'ASC' } = options;

    const where = {};

    // 父分类筛选
    if (parentId !== undefined) {
      where.parent_id = parentId;
    }

    // 关键词搜索
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
      ];
    }

    const queryOptions = {
      where,
      order: [[sortBy, sortOrder]],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM posts 
              WHERE posts.category_id = "Category"."id" 
              AND posts.status = 'published'
            )`),
            'post_count'
          ]
        ]
      },
    };

    if (includeChildren) {
      queryOptions.include = [
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'description', 'parent_id', 'sort_order', 'created_at', 'updated_at'],
          // 递归包含子分类的子分类
          include: [
            {
              model: Category,
              as: 'children',
              attributes: ['id', 'name', 'slug', 'description', 'parent_id', 'sort_order', 'created_at', 'updated_at'],
            }
          ]
        },
      ];
    }

    return await Category.findAll(queryOptions);
  }

  /**
   * 更新分类
   */
  async update(id, categoryData) {
    const category = await Category.findByPk(id);
    if (!category) {
      return null;
    }

    await category.update(categoryData);
    return category;
  }

  /**
   * 删除分类
   */
  async delete(id) {
    const category = await Category.findByPk(id);
    if (!category) {
      return null;
    }

    await category.destroy();
    return category;
  }

  /**
   * 检查分类是否有关联的文章
   */
  async hasAssociatedPosts(id) {
    const count = await Post.count({
      where: { category_id: id },
    });

    return count > 0;
  }

  /**
   * 获取分类的文章数量（包括子分类）
   */
  async getPostCount(id, includeChildren = false) {
    if (!includeChildren) {
      const count = await withRetry(() => Post.count({
        where: {
          category_id: id,
          status: 'published'
        }
      }));
      return count;
    }

    const ids = await withRetry(() => sequelize.query(
      'WITH RECURSIVE cte AS (\n' +
      '  SELECT id, parent_id FROM categories WHERE id = :root\n' +
      '  UNION ALL\n' +
      '  SELECT c.id, c.parent_id FROM categories c INNER JOIN cte ON c.parent_id = cte.id\n' +
      ') SELECT id FROM cte;',
      { type: sequelize.QueryTypes.SELECT, replacements: { root: id } }
    ));

    const categoryIds = ids.map(r => r.id);
    const count = await withRetry(() => Post.count({
      where: {
        category_id: { [Op.in]: categoryIds },
        status: 'published'
      }
    }));

    return count;
  }

  /**
   * 检查 slug 是否已存在
   */
  async slugExists(slug, excludeId = null) {
    const where = { slug };
    
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const category = await Category.findOne({ where });
    return !!category;
  }

  /**
   * 统计分类数量
   */
  async count(filters = {}) {
    const where = {};

    if (filters.parentId !== undefined) {
      where.parent_id = filters.parentId;
    }

    return await Category.count({ where });
  }

  /**
   * 获取分类的所有子分类（递归）
   */
  async getDescendants(id) {
    const children = await Category.findAll({
      where: { parent_id: id },
    });

    const descendants = [...children];

    for (const child of children) {
      const childDescendants = await this.getDescendants(child.id);
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  async getPostCountsForCategoryIds(categoryIds = []) {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return [];
    }
    const rows = await withRetry(() => Post.findAll({
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        category_id: { [Op.in]: categoryIds },
        status: 'published'
      },
      group: ['category_id']
    }));
    return rows.map(r => ({ category_id: r.get('category_id'), count: parseInt(r.get('count'), 10) || 0 }));
  }
}

module.exports = new CategoryRepository();
