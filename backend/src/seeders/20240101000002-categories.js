'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('categories', [
      {
        name: '技术',
        slug: 'technology',
        description: '技术相关文章',
        parent_id: null,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: '生活',
        slug: 'life',
        description: '生活随笔',
        parent_id: null,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: '前端开发',
        slug: 'frontend',
        description: '前端开发技术',
        parent_id: 1, // 技术分类的子分类
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: '后端开发',
        slug: 'backend',
        description: '后端开发技术',
        parent_id: 1, // 技术分类的子分类
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: '旅行',
        slug: 'travel',
        description: '旅行见闻',
        parent_id: 2, // 生活分类的子分类
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
