'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('links', [
      {
        name: 'GitHub',
        url: 'https://github.com',
        logo: null,
        description: '全球最大的代码托管平台',
        sort_order: 1,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Stack Overflow',
        url: 'https://stackoverflow.com',
        logo: null,
        description: '程序员问答社区',
        sort_order: 2,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        logo: null,
        description: 'Web 开发文档',
        sort_order: 3,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Node.js 官网',
        url: 'https://nodejs.org',
        logo: null,
        description: 'Node.js 官方网站',
        sort_order: 4,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Express 官网',
        url: 'https://expressjs.com',
        logo: null,
        description: 'Express 框架官方网站',
        sort_order: 5,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('links', null, {});
  }
};
