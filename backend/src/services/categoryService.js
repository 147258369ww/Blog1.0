const categoryRepository = require('../repositories/categoryRepository');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class CategoryService {
  /**
   * 创建分类
   */
  async createCategory(categoryData) {
    try {
      const { name, slug, description, parent_id, sort_order } = categoryData;

      // 验证 slug 唯一性
      const slugExists = await categoryRepository.slugExists(slug);
      if (slugExists) {
        throw new Error('分类 slug 已存在');
      }

      // 如果有父分类，验证父分类是否存在
      if (parent_id) {
        const parentCategory = await categoryRepository.findById(parent_id);
        if (!parentCategory) {
          throw new Error('父分类不存在');
        }
      }

      // 创建分类
      const category = await categoryRepository.create({
        name,
        slug,
        description,
        parent_id: parent_id || null,
        sort_order: sort_order || 0,
      });

      logger.info(`Category created: ${category.id}`);
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.CATEGORIES}*`);
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.CATEGORY_TREE}*`);
      return category;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * 更新分类
   */
  async updateCategory(categoryId, categoryData) {
    try {
      const { name, slug, description, parent_id, sort_order } = categoryData;

      // 查找分类
      const category = await categoryRepository.findById(categoryId);
      if (!category) {
        throw new Error('分类不存在');
      }

      // 验证 slug 唯一性（如果修改了 slug）
      if (slug && slug !== category.slug) {
        const slugExists = await categoryRepository.slugExists(slug, categoryId);
        if (slugExists) {
          throw new Error('分类 slug 已存在');
        }
      }

      // 如果修改了父分类，验证父分类是否存在
      if (parent_id !== undefined && parent_id !== null) {
        // 不能将分类设置为自己的子分类
        if (parent_id === categoryId) {
          throw new Error('不能将分类设置为自己的子分类');
        }

        const parentCategory = await categoryRepository.findById(parent_id);
        if (!parentCategory) {
          throw new Error('父分类不存在');
        }

        // 检查是否会形成循环引用
        const descendants = await categoryRepository.getDescendants(categoryId);
        const descendantIds = descendants.map(d => d.id);
        if (descendantIds.includes(parent_id)) {
          throw new Error('不能将分类设置为其子分类的子分类（循环引用）');
        }
      }

      // 准备更新数据
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (description !== undefined) updateData.description = description;
      if (parent_id !== undefined) updateData.parent_id = parent_id;
      if (sort_order !== undefined) updateData.sort_order = sort_order;

      // 更新分类
      const updatedCategory = await categoryRepository.update(categoryId, updateData);

      logger.info(`Category updated: ${categoryId}`);
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.CATEGORIES}*`);
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.CATEGORY_TREE}*`);
      return updatedCategory;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * 删除分类
   */
  async deleteCategory(categoryId) {
    try {
      // 查找分类
      const category = await categoryRepository.findById(categoryId);
      if (!category) {
        throw new Error('分类不存在');
      }

      // 检查是否有关联的文章
      const hasAssociatedPosts = await categoryRepository.hasAssociatedPosts(categoryId);
      if (hasAssociatedPosts) {
        throw new Error('该分类下有关联的文章，无法删除');
      }

      // 检查是否有子分类
      const children = await categoryRepository.findAll({ parentId: categoryId });
      if (children.length > 0) {
        throw new Error('该分类下有子分类，无法删除');
      }

      // 删除分类
      await categoryRepository.delete(categoryId);

      logger.info(`Category deleted: ${categoryId}`);
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.CATEGORIES}*`);
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.CATEGORY_TREE}*`);
      return { message: '分类已删除' };
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * 获取分类详情
   */
  async getCategory(categoryId, options = {}) {
    try {
      const category = await categoryRepository.findById(categoryId, options);

      if (!category) {
        throw new Error('分类不存在');
      }

      return category;
    } catch (error) {
      logger.error('Error getting category:', error);
      throw error;
    }
  }

  /**
   * 根据 slug 获取分类
   */
  async getCategoryBySlug(slug, options = {}) {
    try {
      const category = await categoryRepository.findBySlug(slug, options);

      if (!category) {
        throw new Error('分类不存在');
      }

      return category;
    } catch (error) {
      logger.error('Error getting category by slug:', error);
      throw error;
    }
  }

  /**
   * 获取分类列表
   */
  async getCategories(filters = {}, options = {}) {
    try {
      const key = `${cacheService.KEY_PREFIXES.CATEGORIES}list`;
      const categories = await cacheService.getOrSet(key, async () => {
        return await categoryRepository.findAll(filters, options);
      }, 300);
      
      // 转换字段名以匹配前端期望的格式，并获取文章数量
      const ids = categories.map(c => c.id);
      const counts = await categoryRepository.getPostCountsForCategoryIds(ids);
      const countsMap = new Map(counts.map(item => [item.category_id, item.count]));

      const result = categories.map((category) => {
        const articleCount = countsMap.get(category.id) || 0;
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          parentId: category.parent_id,
          sort: category.sort_order,
          articleCount: articleCount,
          createdAt: category.created_at,
          updatedAt: category.updated_at,
        };
      });
      
      return result;
    } catch (error) {
      logger.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * 获取顶级分类列表（没有父分类的分类）
   */
  async getTopLevelCategories(options = {}) {
    try {
      const categories = await categoryRepository.findAll(
        { parentId: null },
        { ...options, includeChildren: true }
      );
      return categories;
    } catch (error) {
      logger.error('Error getting top level categories:', error);
      throw error;
    }
  }

  /**
   * 获取分类树（层级结构）
   */
  async getCategoryTree() {
    try {
      const cached = await cacheService.get(`${cacheService.KEY_PREFIXES.CATEGORY_TREE}all`);
      if (cached) {
        return cached;
      }
      const topLevelCategories = await this.getTopLevelCategories({ includeChildren: true });
      
      // 递归构建完整的树结构
      const buildTree = async (categories) => {
        const tree = [];
        for (const category of categories) {
          // 获取该分类的文章数量（包括子分类）
          const cacheKey = cacheService.generateKey(cacheService.KEY_PREFIXES.CATEGORY, category.id, 'post_count_with_children');
          const articleCount = await cacheService.getOrSet(cacheKey, async () => {
            return await categoryRepository.getPostCount(category.id, true);
          }, 300);
          
          const node = {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            parentId: category.parent_id,
            sort: category.sort_order,
            articleCount: articleCount,
            createdAt: category.created_at,
            updatedAt: category.updated_at,
            children: [],
          };

          if (category.children && category.children.length > 0) {
            node.children = await buildTree(category.children);
          }

          tree.push(node);
        }
        return tree;
      };

      const tree = await buildTree(topLevelCategories);
      await cacheService.set(`${cacheService.KEY_PREFIXES.CATEGORY_TREE}all`, tree, 600);
      return tree;
    } catch (error) {
      logger.error('Error getting category tree:', error);
      throw error;
    }
  }

  /**
   * 统计分类数量
   */
  async countCategories(filters = {}) {
    try {
      const count = await categoryRepository.count(filters);
      return count;
    } catch (error) {
      logger.error('Error counting categories:', error);
      throw error;
    }
  }

  /**
   * 获取分类下的文章
   */
  async getCategoryPosts(categoryId, pagination = {}) {
    try {
      // 验证分类是否存在
      const category = await categoryRepository.findById(categoryId);
      if (!category) {
        throw new Error('分类不存在');
      }

      // 获取分类下的文章
      const postRepository = require('../repositories/postRepository');
      const { page = 1, limit = 10, sortBy = 'published_at', sortOrder = 'DESC' } = pagination;
      const key = cacheService.generateKey(
        cacheService.KEY_PREFIXES.CATEGORY,
        categoryId,
        `posts:page:${page}:limit:${limit}:sortBy:${sortBy}:sortOrder:${sortOrder}`
      );
      const result = await cacheService.getOrSet(key, async () => {
        return await postRepository.findAll(
          {
            categoryId,
            status: 'published',
          },
          { page, limit, sortBy, sortOrder },
          { includeDeleted: false }
        );
      }, 120);

      return result;
    } catch (error) {
      logger.error('Error getting category posts:', error);
      throw error;
    }
  }

  /**
   * 更新分类排序
   */
  async updateCategorySort(sortData) {
    try {
      // 批量更新分类排序
      const updatePromises = sortData.map(({ id, sort }) =>
        categoryRepository.update(id, { sort_order: sort })
      );

      await Promise.all(updatePromises);

      logger.info(`Updated sort order for ${sortData.length} categories`);
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.CATEGORIES}*`);
      await cacheService.deletePattern(`${cacheService.KEY_PREFIXES.CATEGORY_TREE}*`);
      return { updated: sortData.length };
    } catch (error) {
      logger.error('Error updating category sort:', error);
      throw error;
    }
  }
}

module.exports = new CategoryService();
